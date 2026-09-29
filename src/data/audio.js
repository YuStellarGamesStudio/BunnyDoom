// All musical values and the 12 sound designs live here or in assets/audios/*.json.
// Each operator is a real OPM.js four-operator FM operator, not an oscillator fallback.
const op = (ratio, level, a, d, s, r, detune = 0) =>
  ({ ratio, level, detune, adsr: { a, d, s, r } });
const voice = (name, algorithm, feedback, modIndex, lfo, ops) =>
  ({ version: 1, name, algorithm, feedback, modIndex, lfo, ops });

export const INSTRUMENTS = {
  bell: voice('bell', 4, 1, 6, { rate: 0, amDepth: 0, pmDepth: 0 }, [
    op(1, .53, .004, .28, .06, .055), op(3.98, .31, .002, .12, .01, .04),
    op(2, .23, .005, .17, .02, .04), op(5.03, .14, .002, .09, .01, .035)
  ]),
  brass: voice('brass', 1, 3, 4, { rate: 5, amDepth: .035, pmDepth: 7 }, [
    op(1, .44, .015, .12, .72, .045), op(2, .25, .013, .1, .48, .04),
    op(1, .18, .008, .1, .63, .04), op(3, .12, .01, .08, .32, .035)
  ]),
  pluck: voice('pluck', 5, 1, 5, { rate: 0, amDepth: 0, pmDepth: 0 }, [
    op(1, .5, .002, .13, .08, .035), op(2.01, .31, .001, .08, .02, .03),
    op(3, .18, .002, .11, .04, .03), op(1, .08, .003, .08, .05, .03)
  ]),
  bass: voice('bass', 0, 2, 3.7, { rate: 0, amDepth: 0, pmDepth: 0 }, [
    op(1, .62, .005, .1, .55, .045), op(1.01, .32, .001, .07, .33, .04),
    op(2, .18, .002, .05, .1, .035), op(3, .13, .001, .04, .07, .03)
  ]),
  pad: voice('pad', 7, 0, 1.3, { rate: 3.3, amDepth: .055, pmDepth: 8 }, [
    op(1, .27, .055, .24, .62, .055), op(1.5, .15, .047, .2, .52, .055),
    op(2, .12, .04, .18, .51, .055), op(3, .08, .045, .2, .42, .055)
  ]),
  wood: voice('wood', 2, 0, 4.2, { rate: 0, amDepth: 0, pmDepth: 0 }, [
    op(1, .52, .003, .09, .13, .025), op(4, .29, .002, .05, .02, .02),
    op(2, .15, .002, .05, .04, .02), op(7, .13, .001, .035, .01, .02)
  ]),
  ice: voice('ice', 6, 0, 3.4, { rate: 4.2, amDepth: .07, pmDepth: 12 }, [
    op(1, .35, .013, .23, .38, .05), op(2.71, .17, .008, .16, .14, .04),
    op(3.96, .13, .005, .12, .09, .04), op(5.7, .09, .004, .09, .04, .03)
  ]),
  space: voice('space', 3, 2, 5.5, { rate: 6, amDepth: .085, pmDepth: 22 }, [
    op(1, .39, .018, .18, .57, .055), op(1.41, .23, .01, .15, .35, .05),
    op(2.01, .15, .012, .13, .24, .045), op(3, .12, .009, .13, .17, .045)
  ]),
  noise: voice('noise', 6, 6, 12, { rate: 0, amDepth: 0, pmDepth: 0 }, [
    op(1, .46, .001, .06, .015, .028), op(7.93, .34, .001, .045, .005, .025),
    op(11.2, .23, .001, .04, .003, .025), op(15.93, .16, .001, .03, .002, .02)
  ])
};

// offset and length are seconds; a different FM timbre, register and contour for each cue.
export const SFX = {
  spawn:   [['wood', 72, 0, .065], ['pluck', 79, .06, .09]],
  hit:     [['brass', 62, 0, .085], ['wood', 86, 0, .035]],
  critical:[['brass', 72, 0, .1], ['bell', 84, .1, .18]],
  miss:    [['wood', 55, 0, .11], ['wood', 48, .12, .12]],
  hazard:  [['noise', 38, 0, .13], ['brass', 45, .12, .16]],
  gold:    [['bell', 79, 0, .11], ['bell', 86, .12, .12], ['bell', 91, .25, .17]],
  silver:  [['ice', 76, 0, .13], ['ice', 83, .13, .15]],
  charge:  [['space', 60, 0, .1], ['space', 67, .11, .11]],
  special: [['brass', 55, 0, .26], ['space', 67, .08, .23], ['bell', 79, .24, .25]],
  roar:    [['noise', 35, 0, .24], ['brass', 38, .06, .36], ['brass', 43, .28, .32]],
  win:     [['brass', 67, 0, .16], ['bell', 72, .18, .15], ['bell', 79, .37, .3]],
  lose:    [['space', 57, 0, .2], ['brass', 52, .22, .2], ['wood', 45, .46, .22]]
};

export const SFX_ALIASES = { pickup: 'silver', bomb: 'hazard', fake: 'hazard', bossHit: 'hit', bossRoar: 'roar', victory: 'win', defeat: 'lose' };
export const SCENES = ['title', 'map', 'loadout', 'skills', 'result', 'boss', 'world0', 'world1', 'world2', 'world3', 'world4', 'world5'];
export const TRACK_URLS = Object.fromEntries(SCENES.map(name => [name, new URL(`../../assets/audios/${name}.json`, import.meta.url)]));
export const AUDIO_LIMITS = Object.freeze({ voices: 8, musicVoices: 5, effectVoices: 3, events: 256, release: .06, maxFutureNotes: 110, tickMs: 40 });
