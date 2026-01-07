console.log("HEX EDGE FLOW + GRABX BACKGROUND");

const canvas = document.getElementById("hexagonCanvas");
const ctx = canvas.getContext("2d");

const HEX_SIZE = 18;
const BASE_SPEED = 0.45; // units per second
const BASE_DENSITY = 0.00045; // lines per pixel (scaled by viewport area)

const COLORS = [
  { stroke: "rgba(255,255,255,0.85)", glow: "rgba(255,255,255,0.22)", blur: 12 },
  { stroke: "rgba(0,180,255,0.85)", glow: "rgba(0,150,255,0.18)", blur: 16 },
  { stroke: "rgba(0,90,200,0.75)", glow: "rgba(0,100,255,0.16)", blur: 18 }
];

const hexes = [];
const flows = [];
let shimmer = 0;
let pulseTimer = 0;
let pulseActive = false;
let lastTime = performance.now();

function resizeCanvas() {
  // cap DPR to reduce workload on high-DPI screens
  const rawDpr = window.devicePixelRatio || 1;
  const dpr = Math.min(rawDpr, 1.5);
  canvas.width = Math.round(window.innerWidth * dpr);
  canvas.height = Math.round(window.innerHeight * dpr);
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  hexes.length = 0;
  flows.length = 0;
  generateGrid();

  // scale number of flows by viewport area to maintain consistent density
  const area = window.innerWidth * window.innerHeight;
  const targetLines = Math.max(800, Math.floor(area * BASE_DENSITY));

  for (let i = 0; i < targetLines; i++) {
    flows.push({
      hex: Math.floor(Math.random() * hexes.length),
      edge: Math.floor(Math.random() * 6),
      t: Math.random(),
      speed: BASE_SPEED * (0.6 + Math.random() * 1.4),
      colorIndex: i % COLORS.length
    });
  }
}

window.addEventListener("resize", resizeCanvas);

function hexVertices(cx, cy, r) {
  return Array.from({ length: 6 }, (_, i) => {
    const a = Math.PI / 3 * i + Math.PI / 6;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  });
}

function generateGrid() {
  const w = Math.sqrt(3) * HEX_SIZE;
  const h = 2 * HEX_SIZE;
  const step = h * 0.75;
  let row = 0;

  for (let y = -h; y < window.innerHeight + h; y += step) {
    const offset = row % 2 ? w / 2 : 0;
    for (let x = -w; x < window.innerWidth + w; x += w) {
      hexes.push(hexVertices(x + offset, y, HEX_SIZE));
    }
    row++;
  }
}

function animate(now) {
  // time delta in seconds, capped for stability
  const dt = Math.min(0.04, (now - lastTime) / 1000);
  lastTime = now;

  // softer trail fade
  ctx.fillStyle = 'rgba(4,10,20,0.22)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  shimmer += dt * 1.8;

  // pulse logic: infrequent shock that speeds flows briefly
  pulseTimer += dt;
  if (pulseTimer > 3.5 + Math.random() * 2.5) {
    pulseTimer = 0;
    pulseActive = true;
  }
  // pulse lasts short duration
  if (pulseActive) {
    if (pulseTimer > 0.45) pulseActive = false;
  }

  // batch draws by color to reduce state changes
  ctx.lineCap = 'round';
  const flowsByColor = {};
  for (let i = 0; i < flows.length; i++) {
    const f = flows[i];
    (flowsByColor[f.colorIndex] = flowsByColor[f.colorIndex] || []).push(f);
  }

  ctx.globalCompositeOperation = 'lighter';

  for (const colorIndexStr in flowsByColor) {
    const colorIndex = Number(colorIndexStr);
    const col = COLORS[colorIndex];
  ctx.strokeStyle = col.stroke;
  ctx.shadowColor = col.glow;
  // reduce blur for dimmer glow
  ctx.shadowBlur = col.blur * 0.75;
  ctx.lineWidth = 1.2;

    const list = flowsByColor[colorIndex];
    ctx.beginPath();
    for (let i = 0; i < list.length; i++) {
      const f = list[i];
  // apply pulse multiplier to create shock movement
  const pulseMul = pulseActive ? (1.8 + Math.random() * 0.8) : 1.0;
  f.t += f.speed * dt * pulseMul;
      if (f.t > 1) f.t -= 1;

      const h = hexes[f.hex];
      const a = h[f.edge];
      const b = h[(f.edge + 1) % 6];
      const eased = 0.5 - 0.5 * Math.cos(Math.PI * f.t);
      const x = a.x + (b.x - a.x) * eased;
      const y = a.y + (b.y - a.y) * eased;

  // draw shorter segments so pulses look like fast strokes
  const segmentLength = 0.34 + (pulseActive ? 0.18 : 0);
  const sx = a.x + (b.x - a.x) * Math.max(0, f.t - segmentLength);
  const sy = a.y + (b.y - a.y) * Math.max(0, f.t - segmentLength);
  ctx.moveTo(sx, sy);
  ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  ctx.globalCompositeOperation = 'source-over';

  requestAnimationFrame(animate);
}

resizeCanvas();
requestAnimationFrame(animate);
