async function svgImage(name, width, height) {
  const response = await fetch(new URL(`../assets/art/${name}.svg`, import.meta.url));
  if (!response.ok) throw new Error(`Missing vector: ${name}`);
  const document = new DOMParser().parseFromString(await response.text(), 'image/svg+xml');
  document.documentElement.setAttribute('width', width);
  document.documentElement.setAttribute('height', height);
  const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(document)], { type: 'image/svg+xml' }));
  try {
    const image = new Image(); image.src = url; await image.decode(); return image;
  } finally { URL.revokeObjectURL(url); }
}
function canvas(width, height) {
  const element = document.createElement('canvas'); element.width = width; element.height = height; return element;
}
export async function rasterizeArt() {
  const layoutResponse = await fetch(new URL('../assets/atlases/layout.json', import.meta.url));
  const layout = await layoutResponse.json();
  const output = {};
  const sprites = canvas(...layout.size), context = sprites.getContext('2d');
  const [tile] = layout.tile;
  for (let i = 0; i < layout.sprites.length; i++) {
    context.drawImage(await svgImage(layout.sprites[i], tile, tile), i % 8 * tile, Math.floor(i / 8) * tile, tile, tile);
  }
  output['assets/atlases/sprites.png'] = sprites.toDataURL('image/png');
  const heroes = canvas(4096, 2048), heroContext = heroes.getContext('2d');
  for (let i = 0; i < 7; i++) heroContext.drawImage(await svgImage(i === 6 ? 'dog' : `boss-${i}`, 1024, 1024), i % 4 * 1024, Math.floor(i / 4) * 1024, 1024, 1024);
  output['assets/atlases/heroes.png'] = heroes.toDataURL('image/png');
  const worlds = canvas(5760, 2160), worldContext = worlds.getContext('2d');
  for (let i = 0; i < 6; i++) worldContext.drawImage(await svgImage(`world-${i}`, 1920, 1080), i % 3 * 1920, Math.floor(i / 3) * 1080, 1920, 1080);
  output['assets/atlases/worlds.png'] = worlds.toDataURL('image/png');
  for (const [name, size, maskable] of [['icon-64',64,false],['icon-192',192,false],['icon-512',512,false],['icon-maskable-512',512,true],['apple-touch-icon',180,false]]) {
    const icon = canvas(size,size), ctx = icon.getContext('2d');
    ctx.fillStyle='#45245e';ctx.fillRect(0,0,size,size);
    const inset=maskable?size*.1:0;
    ctx.drawImage(await svgImage('app-icon',size,size),inset,inset,size-inset*2,size-inset*2);
    output[`assets/icons/${name}.png`]=icon.toDataURL('image/png');
  }
  const stage = canvas(1920,1080);
  stage.getContext('2d').drawImage(await svgImage('stage',1920,1080),0,0,1920,1080);
  output['assets/atlases/stage.png']=stage.toDataURL('image/png');
  const large = canvas(2400,1260);large.getContext('2d').drawImage(await svgImage('title',2400,1260),0,0,2400,1260);
  for (const [i, type] of ['normal', 'gold', 'silver'].entries()) {
    large.getContext('2d').drawImage(await svgImage(`rabbit-${type}`, 270, 270), 840 + i * 240, 850, 270, 270);
  }
  const og = canvas(1200,630);og.getContext('2d').drawImage(large,0,0,1200,630);
  output['assets/icons/og.png']=og.toDataURL('image/png');
  return output;
}
