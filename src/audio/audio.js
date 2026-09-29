import { OPM } from '../vendor/opm/dist/api/index.js';
import { INSTRUMENTS, SFX, SFX_ALIASES, SCENES, TRACK_URLS, AUDIO_LIMITS as LIMITS } from '../data/audio.js';

const clamp = value => Math.min(100, Math.max(0, Number.isFinite(Number(value)) ? Number(value) : 0));
const releaseAt = (note, release = LIMITS.release) => note.end + release;

function scoreBar(track, index) {
  const { bpm, beats = 4, motifs, order, roots, counterLine, arpIntervals, groove, swing = 0 } = track;
  const beat = 60 / bpm;
  const root = roots[index % roots.length];
  const melody = motifs[order[index % order.length]];
  const halfSteps = beats * 2;
  const notes = [];
  const add = (lane, instrument, pitch, position, length) => {
    if (pitch == null) return;
    const swingOffset = position % 1 ? swing * beat * .5 : 0;
    notes.push({ lane, instrument, pitch, at: position * beat + swingOffset, duration: length });
  };
  for (let step = 0; step < halfSteps; step++) {
    const pos = step / 2;
    const lead = melody[step];
    add('lead', track.lead, lead, pos, Math.max(.065, beat * .5 - .075));
    // The repeating harmony is composed in each score, not randomized at runtime.
    add('arp', track.arp, root + 12 + arpIntervals[step % arpIntervals.length], pos, Math.max(.06, beat * .5 - .075));
  }
  for (let pos = 0; pos < beats; pos++) {
    add('bass', track.bass, root + (groove === 'funk' && pos === beats - 1 ? 7 : 0), pos, beat * .71);
    const drumPitch = groove === 'float' || groove === 'orbit'
      ? (pos === 0 ? 48 : 72)
      : (pos % 2 ? 78 : 43);
    add('drum', track.drum, drumPitch, pos, Math.min(.11, beat * .25));
  }
  const harmony = counterLine[index % counterLine.length];
  add('counter', track.counter, harmony[0], 0, beat * (beats / 2 - .13));
  add('counter', track.counter, harmony[1], beats / 2, beat * (beats / 2 - .13));
  return notes.sort((a, b) => a.at - b.at);
}

function checkTrack(track) {
  if (!track || !Number.isFinite(track.bpm) || track.bpm < 60 || track.bpm > 220 ||
      ![3, 4].includes(track.beats ?? 4) || !Array.isArray(track.roots) || track.roots.length !== 8 ||
      !Array.isArray(track.motifs) || !Array.isArray(track.order) || track.order.length !== 8 ||
      !Array.isArray(track.counterLine) || track.counterLine.length !== 8 ||
      !Array.isArray(track.arpIntervals) || track.arpIntervals.length < (track.beats ?? 4) * 2 ||
      !['lead', 'counter', 'arp', 'bass', 'drum'].every(part => Object.hasOwn(INSTRUMENTS, track[part]))) {
    throw new Error('Invalid FM music score');
  }
  const beats = track.beats ?? 4;
  if (track.motifs.some(m => !Array.isArray(m) || m.length !== beats * 2 ||
      m.some(pitch => pitch !== null && (!Number.isInteger(pitch) || pitch < 0 || pitch > 127))) ||
      track.order.some(i => !Number.isInteger(i) || i < 0 || i >= track.motifs.length) ||
      track.roots.some(pitch => !Number.isInteger(pitch) || pitch < 24 || pitch > 72) ||
      track.counterLine.some(pair => !Array.isArray(pair) || pair.length !== 2 || pair.some(p => !Number.isInteger(p) || p < 0 || p > 127)) ||
      track.arpIntervals.some(offset => !Number.isInteger(offset) || offset < -12 || offset > 36)) {
    throw new Error('Invalid FM music notes');
  }
  return track;
}

/** Owns one OPM worklet (one shared eight-voice synth) and no other audio generator. */
export class AudioManager {
  constructor() {
    this.opm = new OPM();
    this.settings = { bgm: true, sfx: true, bgmVolume: 65, sfxVolume: 80 };
    this.scene = null;
    this.track = null;
    this.tracks = new Map();
    this.fetches = new Map();
    this.notes = [];
    this.started = false;
    this.destroyed = false;
    this.starting = null;
    this.timer = null;
    this.generation = 0;
    this.barIndex = 0;
    this.barZero = 0;
    this.musicVoices = new Map();
    this.effectVoices = new Map();
  }

  // Called by a pointer/keyboard gesture. Startup rejects internally so callers that do
  // not await it cannot create unhandled rejections or prevent play without sound.
  start() {
    if (this.destroyed) return Promise.resolve(false);
    if (this.started) return Promise.resolve(true);
    if (this.starting) return this.starting;
    this.starting = this.opm.start().then(() => {
      if (this.destroyed) { void this.opm.close().catch(() => {}); return false; }
      this.started = true;
      this.updateVoices();
      if (this.scene) this.loadScene(this.scene, this.generation);
      return true;
    }).catch(error => {
      console.warn('FM audio unavailable:', error);
      return false;
    }).finally(() => { this.starting = null; });
    return this.starting;
  }

  updateVoices() {
    for (const [instrument, definition] of Object.entries(INSTRUMENTS)) {
      for (const [group, volume, target] of [
        ['music', this.settings.bgmVolume, this.musicVoices],
        ['effect', this.settings.sfxVolume, this.effectVoices]
      ]) {
        const name = `${group}_${instrument}`;
        // OPM has no per-note gain or submix API. Scale operator levels once per
        // settings change, then register separate presets on the same eight-voice node.
        const scale = volume / 100;
        this.opm.loadVoice(name, { ...definition, name, ops: definition.ops.map(operator => ({
          ...operator, level: operator.level * scale
        })) });
        target.set(instrument, name);
      }
    }
  }

  setSettings(next = {}) {
    if (this.destroyed) return;
    const previous = this.settings;
    this.settings = {
      bgm: next.bgm === undefined ? previous.bgm : Boolean(next.bgm),
      sfx: next.sfx === undefined ? previous.sfx : Boolean(next.sfx),
      bgmVolume: next.bgmVolume === undefined ? previous.bgmVolume : clamp(next.bgmVolume),
      sfxVolume: next.sfxVolume === undefined ? previous.sfxVolume : clamp(next.sfxVolume)
    };
    if (!this.started) return;
    const musicChanged = previous.bgm !== this.settings.bgm || previous.bgmVolume !== this.settings.bgmVolume;
    const effectsChanged = previous.sfx !== this.settings.sfx || previous.sfxVolume !== this.settings.sfxVolume;
    if (musicChanged) this.generation++;
    if (effectsChanged) this.stopGroup('effect');
    if (musicChanged) this.stopGroup('music');
    if (musicChanged || effectsChanged) this.updateVoices();
    if (musicChanged) {
      this.resetMusic();
      if (this.scene && this.settings.bgm && this.settings.bgmVolume) this.loadScene(this.scene, this.generation);
    }
  }

  playScene(name) {
    if (this.destroyed || !SCENES.includes(name) || this.scene === name) return;
    this.scene = name;
    this.generation++;
    this.stopGroup('music');
    this.resetMusic();
    if (this.started) this.loadScene(name, this.generation);
  }

  async loadScene(name, generation) {
    try {
      let track = this.tracks.get(name);
      if (!track) {
        let fetchPromise = this.fetches.get(name);
        if (!fetchPromise) {
          fetchPromise = fetch(TRACK_URLS[name]).then(response => {
            if (!response.ok) throw new Error(`FM score ${name}: HTTP ${response.status}`);
            return response.json();
          }).then(checkTrack);
          this.fetches.set(name, fetchPromise);
        }
        track = await fetchPromise;
        this.tracks.set(name, track);
      }
      if (this.destroyed || !this.started || generation !== this.generation || !this.settings.bgm || !this.settings.bgmVolume) return;
      this.track = track;
      this.barIndex = 0;
      this.barZero = this.opm.context.currentTime + .09;
      this.timer = setInterval(() => this.schedule(), LIMITS.tickMs);
      this.schedule();
    } catch (error) {
      this.fetches.delete(name);
      console.warn('FM score unavailable:', error);
    }
  }

  resetMusic() {
    clearInterval(this.timer);
    this.timer = null;
    this.track = null;
  }

  // A note's off event is already scheduled by OPM. Its release occupies a voice
  // even after note-off; entries only expire after this known preset upper bound.
  cleanup(now) {
    this.notes = this.notes.filter(note => releaseAt(note) > now);
  }

  stopGroup(group) {
    if (!this.started) return;
    const now = this.opm.context.currentTime;
    for (const note of this.notes) {
      if (note.group !== group || note.cancelled) continue;
      this.opm.stop(note.id); // cancels future starts or releases sounding notes
      note.cancelled = true;
      if (note.start > now) note.end = now - LIMITS.release;
      else note.end = Math.min(note.end, now);
    }
    this.cleanup(now);
  }

  queueSize(now) {
    return this.notes.reduce((total, note) => total + (note.cancelled ? 0 : note.start > now ? 2 : note.end > now ? 1 : 0), 0);
  }

  play(instrument, pitch, start, duration, group) {
    const now = this.opm.context.currentTime;
    if (start < now) return false;
    this.cleanup(now);
    if (this.queueSize(now) + 2 > LIMITS.events - 32 ||
        this.notes.filter(note => note.group === group && note.start < start + duration + LIMITS.release && releaseAt(note) > start).length >=
        (group === 'music' ? LIMITS.musicVoices : LIMITS.effectVoices)) return false;
    const id = this.opm.playNote({
      voice: group === 'music' ? this.musicVoices.get(instrument) : this.effectVoices.get(instrument),
      note: pitch, time: Math.max(0, start - now), duration
    });
    this.notes.push({ id, group, start, end: start + duration, cancelled: false });
    return true;
  }

  schedule() {
    if (!this.started || !this.track || !this.settings.bgm || !this.settings.bgmVolume) return;
    const now = this.opm.context.currentTime;
    const { bpm, beats = 4 } = this.track;
    const barDuration = beats * 60 / bpm;
    // Never queue more than the current bar and the next bar. Late/woken tabs
    // skip elapsed bars instead of sending stale notes or a whole song at once.
    while (this.barZero + this.barIndex * barDuration <= now + barDuration) {
      const barStart = this.barZero + this.barIndex * barDuration;
      if (barStart >= now - barDuration) {
        for (const note of scoreBar(this.track, this.barIndex)) {
          const when = barStart + note.at;
          if (when >= now + .008 && this.queueSize(now) < LIMITS.maxFutureNotes * 2) {
            this.play(note.instrument, note.pitch, when, note.duration, 'music');
          }
        }
      }
      this.barIndex++;
    }
  }

  sfx(eventType) {
    if (!this.started || this.destroyed || !this.settings.sfx || !this.settings.sfxVolume) return;
    const design = SFX[SFX_ALIASES[eventType] ?? eventType];
    if (!design) return;
    const now = this.opm.context.currentTime;
    for (const [instrument, pitch, offset, duration] of design) {
      this.play(instrument, pitch, now + .012 + offset, duration, 'effect');
    }
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    this.generation++;
    if (this.timer !== null) clearInterval(this.timer);
    this.timer = null;
    if (this.started) {
      this.stopGroup('music');
      this.stopGroup('effect');
      this.started = false;
      void this.opm.close().catch(error => console.warn('FM audio shutdown failed:', error));
    }
    this.notes.length = 0;
    this.tracks.clear();
    this.fetches.clear();
  }
}
