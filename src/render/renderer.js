import { COSMETICS } from '../data/game.js';
import { RENDER_TIMING } from '../data/render.js';

const ART = new URL('../../assets/atlases/', import.meta.url);
const image = async name => {
  const bitmap = new Image();
  bitmap.src = new URL(name, ART).href;
  await bitmap.decode();
  return bitmap;
};
let atlasPromise;
async function atlases() {
  atlasPromise ??= Promise.all([
    fetch(new URL('layout.json', ART)).then(response => {
      if (!response.ok) throw new Error(`Missing sprite layout: ${response.status}`);
      return response.json();
    }),
    image('sprites.png'), image('worlds.png'), image('heroes.png'), image('stage.png'),
  ]).then(([layout, sprites, worlds, heroes, stage]) => {
    const indices = Object.fromEntries(layout.sprites.map((name, index) => [name, index]));
    return { layout, sprites, worlds, heroes, stage, indices, tinted: new Map() };
  }).catch(error => { atlasPromise = undefined; throw error; });
  return atlasPromise;
}

const cosmeticNames = Object.fromEntries(['hat', 'outfit', 'collar', 'effect'].flatMap(slot =>
  COSMETICS.filter(item => item.slot === slot).map((item, index) => [item.id, `cosmetic-${slot}-${index + 1}`])));

function equipped(cosmetics, slot) {
  const value = cosmetics?.[slot];
  const id = typeof value === 'object' && value !== null ? value.id : value;
  return cosmeticNames[id] || null;
}

const shader = `
struct VertexIn {
  @location(0) position: vec2f,
  @location(1) uv: vec2f,
  @location(2) tint: vec4f,
};
struct VertexOut {
  @builtin(position) position: vec4f,
  @location(0) uv: vec2f,
  @location(1) tint: vec4f,
};
@vertex fn vertex(input: VertexIn) -> VertexOut {
  var output: VertexOut;
  output.position = vec4f(input.position, 0.0, 1.0);
  output.uv = input.uv;
  output.tint = input.tint;
  return output;
}
@group(0) @binding(0) var art: texture_2d<f32>;
@group(0) @binding(1) var artSampler: sampler;
@fragment fn fragment(input: VertexOut) -> @location(0) vec4f {
  return textureSample(art, artSampler, input.uv) * input.tint;
}`;

// Sprite commands are built once per frame, and consumed unchanged by both backends.
function scene(snapshot, cosmetics, assets, effects, now) {
  const commands = [];
  const add = (name, x, y, w, h, opacity = 1, tint = [1, 1, 1]) => {
    if (assets.indices[name] !== undefined) commands.push({ atlas: name === 'dog' || name.startsWith('boss-') ? 2 : 0, name, x, y, w, h, opacity, tint });
  };
  const world = Math.max(0, Math.min(5, snapshot?.world ?? 0));
  commands.push({ atlas: 1, index: world, x: 0, y: 0, w: 960, h: 540, opacity: 1, tint: [1, 1, 1] });
  commands.push({ atlas: 3, x: 0, y: 0, w: 960, h: 540, opacity: 1, tint: [1, 1, 1] });
  const holes = snapshot?.holes || [];
  for (let row = 0; row < 3; row++) for (let col = 0; col < 3; col++) {
    const hole = holes[row * 3 + col];
    const x = hole?.x ?? 300 + col * 180;
    const y = hole?.y ?? 170 + row * 135;
    add('hole', x - 83, y - 34, 166, 88);
  }
  const royalHoles = holes.filter(hole => hole?.type === 'boss');
  if (royalHoles.length) {
    let left = Infinity, right = -Infinity, top = Infinity, bottom = -Infinity, progress = 0;
    for (const hole of royalHoles) {
      left = Math.min(left, hole.x);
      right = Math.max(right, hole.x);
      top = Math.min(top, hole.y);
      bottom = Math.max(bottom, hole.y);
      progress += hole.phase === 'up' ? 1 : Math.max(.05, Math.min(1, hole.progress ?? 1));
    }
    progress /= royalHoles.length;
    // A single king bridges every real weakpoint, rather than cloning little bosses.
    const width = Math.min(420, Math.max(235, right - left + 180, 225 + bottom - top));
    const height = width * progress;
    const baseline = Math.min(528, Math.max(width + 24, bottom + 24));
    add(`boss-${world}`, (left + right - width) / 2, baseline - height,
      width, height, 1);
  }
  for (let row = 0; row < 3; row++) for (let col = 0; col < 3; col++) {
    const hole = holes[row * 3 + col];
    const x = hole?.x ?? 300 + col * 180;
    const y = hole?.y ?? 170 + row * 135;
    if (hole) {
      const emergence = hole.phase === 'up' ? 1 : Math.max(.05, Math.min(1, hole.progress ?? 1));
      const squash = hole.phase === 'rising' ? .74 + emergence * .26 : hole.phase === 'falling' ? .82 + emergence * .18 : 1;
      if (hole.type === 'boss') add('spark', x - 27, y - 64, 54, 54,
        .65 + .3 * Math.sin(now / 160 + col));
      else {
        const height = 122 * emergence * squash;
        const name = hole.type === 'decoy' ? 'rabbit-fake' : `rabbit-${hole.type}`;
        add(name, x - 56, y + 15 - height, 112, height,
          hole.type === 'decoy' ? .72 : 1);
      }
      if (hole.warning) add('impact', x - 56, y - 102, 112, 112, .67);
    }
    if (hole?.type !== 'boss') add('rim', x - 83, y + 5, 166, 65);
  }
  for (const pickup of snapshot?.pickups || []) {
    const bounce = Math.sin(now / 185 + pickup.id) * 4;
    add(`item-${pickup.type}`, pickup.x - 26, pickup.y - 48 + bounce, 52, 52,
      Math.min(1, pickup.remaining * 1.6));
  }
  const strike = effects.findLast(effect => effect.kind === 'hit' || effect.kind === 'critical');
  const attack = strike ? Math.max(0, 1 - (now - strike.at) / RENDER_TIMING.hit) : 0;
  const bob = Math.sin(now / 370) * 3 - Math.sin(attack * Math.PI) * 24;
  const dogX = 38 + Math.sin(attack * Math.PI) * 46;
  add('dog', dogX, 370 + bob, 138, 138);
  for (const slot of ['outfit', 'collar', 'hat', 'effect']) {
    const sprite = equipped(cosmetics, slot);
    if (sprite) add(sprite, dogX, 370 + bob, 138, 138);
  }
  if (snapshot?.boss && snapshot.bossMaxHp > 0) {
    const percentage = Math.max(0, Math.min(1, snapshot.bossHp / snapshot.bossMaxHp));
    add('flash', 280, 34, 400, 19, .8, [.15, .11, .21]);
    if (percentage) add('flash', 284, 38, 392 * percentage, 11, 1,
      snapshot.enraged ? [1, .24, .30] : [1, .47, .58]);
    add('spark', 260 + 392 * percentage, 23, 36, 36, .83);
  }
  for (const effect of effects) {
    const age = (now - effect.at) / effect.duration;
    if (age < 0 || age >= 1) continue;
    if (effect.kind === 'victory' && snapshot?.boss) {
      add('flash', 0, 0, 960, 540, .36 * (1 - age), [1, .87, .63]);
      const size = 300 + age * 140;
      add(`boss-${world}`, 480 - size / 2, 180 + age * 120, size, size * (1 - age * .7), 1 - age);
      for (let i = 0; i < 12; i++) {
        const angle = i * Math.PI / 6;
        add('spark', 455 + Math.cos(angle) * age * 360, 265 + Math.sin(angle) * age * 220,
          50 + age * 30, 50 + age * 30, 1 - age);
      }
    } else if (effect.kind === 'special') {
      add('flash', 0, 0, 960, 540, .52 * (1 - age), [.96, .76, 1]);
      add('dog', -95 + age * 1030, 275 - Math.sin(age * Math.PI) * 86, 265, 265, 1 - .2 * age);
      for (let i = 0; i < 8; i++) add('spark', (i * 223 + 98) % 925, 100 + (i * 101) % 380,
        63 + 43 * age, 63 + 43 * age, 1 - age);
    } else {
      const size = (effect.kind === 'critical' ? 155 : 105) * (.7 + age * .7);
      add(effect.kind === 'bad' ? 'impact' : 'spark', effect.x - size / 2,
        effect.y - 70 - age * 50 - size / 2, size, size, 1 - age,
        effect.kind === 'bad' ? [1, .4, .45] : [1, 1, 1]);
    }
  }
  if (snapshot?.status === 'countdown') {
    const seconds = snapshot.countdown ?? 3;
    const text = seconds <= .25 ? 'count-go' : `count-${Math.max(1, Math.min(3, Math.ceil(seconds)))}`;
    add('flash', 0, 0, 960, 540, .17, [.23, .11, .32]);
    add(text, 380, 169, 200, 200);
  }
  if (snapshot?.status === 'paused') add('flash', 0, 0, 960, 540, .3, [.11, .08, .18]);
  return commands;
}

function spriteRect(command, assets) {
  if (command.atlas === 3) return [0, 0, 1920, 1080, 1920, 1080];
  if (command.atlas === 2) {
    const index = command.name === 'dog' ? 6 : Number(command.name.slice(5));
    return [index % 4 * 1024, Math.floor(index / 4) * 1024, 1024, 1024, 4096, 2048];
  }
  if (command.atlas === 1) {
    const col = command.index % 3;
    const row = (command.index / 3) | 0;
    return [col * 1920, row * 1080, 1920, 1080, 5760, 2160];
  }
  const index = assets.indices[command.name];
  const [tile] = assets.layout.tile;
  return [(index % 8) * tile, ((index / 8) | 0) * tile, tile, tile, ...assets.layout.size];
}

function drawCPU(renderer, commands) {
  const ctx = renderer.context;
  ctx.setTransform(renderer.canvas.width / 960, 0, 0, renderer.canvas.height / 540, 0, 0);
  ctx.clearRect(0, 0, 960, 540);
  for (const command of commands) {
    const [sx, sy, sw, sh] = spriteRect(command, renderer.assets);
    ctx.globalAlpha = command.opacity;
    const imageSource = command.atlas === 3 ? renderer.assets.stage : command.atlas === 2 ? renderer.assets.heroes : command.atlas === 1 ? renderer.assets.worlds : renderer.assets.sprites;
    if (command.tint[0] === 1 && command.tint[1] === 1 && command.tint[2] === 1) {
      ctx.drawImage(imageSource, sx, sy, sw, sh, command.x, command.y, command.w, command.h);
    } else {
      const key = `${command.name}:${command.tint.join(',')}`;
      let tinted = renderer.assets.tinted.get(key);
      if (!tinted) {
        tinted = document.createElement('canvas');
        tinted.width = sw; tinted.height = sh;
        const tintContext = tinted.getContext('2d');
        tintContext.drawImage(imageSource, sx, sy, sw, sh, 0, 0, sw, sh);
        tintContext.globalCompositeOperation = 'multiply';
        tintContext.fillStyle = `rgb(${command.tint.map(value => Math.round(value * 255)).join(' ')})`;
        tintContext.fillRect(0, 0, sw, sh);
        tintContext.globalCompositeOperation = 'destination-in';
        tintContext.drawImage(imageSource, sx, sy, sw, sh, 0, 0, sw, sh);
        renderer.assets.tinted.set(key, tinted);
      }
      ctx.drawImage(tinted, command.x, command.y, command.w, command.h);
    }
  }
  ctx.globalAlpha = 1;
}

function makeTexture(device, bitmap) {
  const texture = device.createTexture({
    size: [bitmap.width, bitmap.height], format: 'rgba8unorm',
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
  });
  device.queue.copyExternalImageToTexture({ source: bitmap }, { texture }, [bitmap.width, bitmap.height]);
  return texture;
}

async function gpuBackend(renderer) {
  if (!navigator.gpu) throw new Error('WebGPU is unavailable');
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) throw new Error('No WebGPU adapter');
  const device = await adapter.requestDevice();
  let context;
  try { context = renderer.canvas.getContext('webgpu'); } catch { /* Canvas still supports 2D. */ }
  if (!context) { device.destroy(); throw new Error('No WebGPU canvas context'); }
  const format = navigator.gpu.getPreferredCanvasFormat();
  context.configure({ device, format, alphaMode: 'opaque' });
  const module = device.createShaderModule({ code: shader });
  const pipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: { module, entryPoint: 'vertex', buffers: [{ arrayStride: 32,
      attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x2' },
        { shaderLocation: 1, offset: 8, format: 'float32x2' },
        { shaderLocation: 2, offset: 16, format: 'float32x4' }] }] },
    fragment: { module, entryPoint: 'fragment', targets: [{ format, blend: {
      color: { srcFactor: 'src-alpha', dstFactor: 'one-minus-src-alpha', operation: 'add' },
      alpha: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha', operation: 'add' },
    } }] },
    primitive: { topology: 'triangle-list' },
  });
  const sampler = device.createSampler({ magFilter: 'linear', minFilter: 'linear' });
  const textures = [renderer.assets.sprites, renderer.assets.worlds, renderer.assets.heroes, renderer.assets.stage].map(bitmap => makeTexture(device, bitmap));
  const groups = textures.map(texture => device.createBindGroup({ layout: pipeline.getBindGroupLayout(0),
    entries: [{ binding: 0, resource: texture.createView() }, { binding: 1, resource: sampler }] }));
  const geometry = new Float32Array(8 * 6 * 96);
  const buffer = device.createBuffer({ size: geometry.byteLength, usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST });
  return { device, context, pipeline, textures, groups, geometry, buffer, format };
}

const CORNERS = [0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1];
function drawGPU(renderer, commands) {
  const { device, context, pipeline, groups, geometry, buffer } = renderer.gpu;
  const drawBatches = [];
  let count = 0;
  let currentAtlas = -1;
  for (const command of commands) {
    if (count + 6 > geometry.length / 8) break;
    if (command.atlas !== currentAtlas) {
      if (count) drawBatches.at(-1).end = count;
      drawBatches.push({ atlas: command.atlas, start: count, end: 0 });
      currentAtlas = command.atlas;
    }
    const [sx, sy, sw, sh, atlasWidth, atlasHeight] = spriteRect(command, renderer.assets);
    const x0 = command.x / 480 - 1, x1 = (command.x + command.w) / 480 - 1;
    const y0 = 1 - command.y / 270, y1 = 1 - (command.y + command.h) / 270;
    // Inset half a texel to keep linear sampling inside each atlas cell.
    const u0 = (sx + .5) / atlasWidth, u1 = (sx + sw - .5) / atlasWidth;
    const v0 = (sy + .5) / atlasHeight, v1 = (sy + sh - .5) / atlasHeight;
    for (let n = 0; n < 6; n++) {
      const offset = (count + n) * 8;
      const corner = n * 2;
      geometry[offset] = CORNERS[corner] ? x1 : x0;
      geometry[offset + 1] = CORNERS[corner + 1] ? y1 : y0;
      geometry[offset + 2] = CORNERS[corner] ? u1 : u0;
      geometry[offset + 3] = CORNERS[corner + 1] ? v1 : v0;
      geometry[offset + 4] = command.tint[0];
      geometry[offset + 5] = command.tint[1];
      geometry[offset + 6] = command.tint[2];
      geometry[offset + 7] = command.opacity;
    }
    count += 6;
  }
  if (count) drawBatches.at(-1).end = count;
  device.queue.writeBuffer(buffer, 0, geometry, 0, count * 8);
  const encoder = device.createCommandEncoder();
  const pass = encoder.beginRenderPass({ colorAttachments: [{ view: context.getCurrentTexture().createView(),
    loadOp: 'clear', storeOp: 'store', clearValue: { r: .09, g: .07, b: .16, a: 1 } }] });
  pass.setPipeline(pipeline);
  pass.setVertexBuffer(0, buffer);
  for (const batch of drawBatches) {
    pass.setBindGroup(0, groups[batch.atlas]);
    pass.draw(batch.end - batch.start, 1, batch.start);
  }
  pass.end();
  device.queue.submit([encoder.finish()]);
}

function fallback(renderer) {
  if (renderer.destroyed || renderer.mode === 'cpu') return;
  const prior = renderer.canvas;
  const replacement = prior.cloneNode(false);
  replacement.width = prior.width;
  replacement.height = prior.height;
  prior.replaceWith(replacement);
  renderer.canvas = replacement;
  renderer.context = replacement.getContext('2d');
  renderer.mode = 'cpu';
  renderer.gpu = null;
  if (renderer.lastCommands) drawCPU(renderer, renderer.lastCommands);
  renderer.onFallback?.(renderer);
}

export async function createRenderer(canvas, { forceCPU = false, onFallback } = {}) {
  const assets = await atlases();
  const renderer = {
    canvas, assets, onFallback, mode: 'cpu', gpu: null, context: null, destroyed: false,
    lastCommands: null, effects: [], visualTime: 0, lastFrameTime: null,
    draw(snapshot, { cosmetics = {}, lang = 'en' } = {}) {
      if (this.destroyed || !snapshot) return;
      const frameTime = performance.now();
      if (snapshot.status !== 'paused' && this.lastFrameTime !== null) {
        this.visualTime += Math.min(RENDER_TIMING.maxFrameMs, frameTime - this.lastFrameTime);
      }
      this.lastFrameTime = frameTime;
      const now = this.visualTime;
      this.effects = this.effects.filter(item => now - item.at < item.duration);
      const commands = scene(snapshot, cosmetics, this.assets, this.effects, now);
      this.lastCommands = commands;
      if (this.mode === 'webgpu') {
        try { drawGPU(this, commands); } catch { fallback(this); }
      } else drawCPU(this, commands);
    },
    feedback(event) {
      if (this.destroyed || !event) return;
      const type = event.type || event.kind || '';
      const kind = type === 'win' ? 'victory' : /special/i.test(type) ? 'special' : /crit/i.test(type) ? 'critical' :
        /hazard|bomb|fake|wrong|penalty/i.test(type) ? 'bad' : 'hit';
      if (!/win|special|hit|crit|gold|silver|hazard|bomb|fake|wrong|penalty|boss/i.test(type)) return;
      this.effects.push({ kind, x: Number(event.x ?? event.hole?.x ?? 480),
        y: Number(event.y ?? event.hole?.y ?? 280), at: this.visualTime,
        duration: RENDER_TIMING[kind] ?? RENDER_TIMING.hit });
      if (this.effects.length > 24) this.effects.splice(0, this.effects.length - 24);
    },
    destroy() {
      this.destroyed = true;
      this.effects.length = 0;
      if (this.gpu) {
        this.gpu.buffer.destroy();
        for (const texture of this.gpu.textures) texture.destroy();
        this.gpu.device.destroy();
        this.gpu = null;
      }
    },
  };
  if (!canvas.width) canvas.width = 960;
  if (!canvas.height) canvas.height = 540;
  if (!forceCPU) {
    try {
      renderer.gpu = await gpuBackend(renderer);
      renderer.mode = 'webgpu';
      renderer.gpu.device.lost.then(() => fallback(renderer));
    } catch {
      // A configured WebGPU canvas cannot become a 2D canvas: replace it instead.
      if (canvas.getContext('2d')) renderer.context = canvas.getContext('2d');
      else {
        const replacement = canvas.cloneNode(false);
        replacement.width = canvas.width;
        replacement.height = canvas.height;
        canvas.replaceWith(replacement);
        renderer.canvas = replacement;
        renderer.context = replacement.getContext('2d');
      }
    }
  } else renderer.context = canvas.getContext('2d');
  return renderer;
}

const portraitImages = new Map();
const portraitRequests = new WeakMap();
async function vectorImage(name) {
  if (!portraitImages.has(name)) {
    const bitmap = new Image();
    bitmap.src = new URL(`../../assets/art/${name}.svg`, import.meta.url).href;
    portraitImages.set(name, bitmap.decode().then(() => bitmap).catch(error => {
      portraitImages.delete(name);
      throw error;
    }));
  }
  return portraitImages.get(name);
}

export async function drawPortrait(canvas, { cosmetics = {}, world = 0, scale = 1 } = {}) {
  const request = (portraitRequests.get(canvas) ?? 0) + 1;
  portraitRequests.set(canvas, request);
  const sceneIndex = Math.max(0, Math.min(5, world | 0));
  const names = [`world-${sceneIndex}`, 'dog', ...['outfit', 'collar', 'hat', 'effect'].map(slot => equipped(cosmetics, slot)).filter(Boolean)];
  const images = await Promise.all(names.map(vectorImage));
  if (portraitRequests.get(canvas) !== request) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const width = canvas.width, height = canvas.height;
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(images[0], 0, 0, width, height);
  const side = Math.min(width * .86, height * .88) * scale;
  const x = (width - side) / 2, y = height - side * .97;
  for (const bitmap of images.slice(1)) ctx.drawImage(bitmap, x, y, side, side);
}
