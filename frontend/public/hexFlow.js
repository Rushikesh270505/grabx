console.log("HEX EDGE FLOW + GRABX BACKGROUND - OPTIMIZED");

const canvas = document.getElementById("hexagonCanvas");
const ctx = canvas.getContext("2d", { alpha: false }); // performance optimization

const HEX_SIZE = 25;
const BASE_SPEED = 0.45; // units per second
const BASE_DENSITY = 0.0007; // doubled from 0.00035 for more lines

const COLORS = [
  { stroke: "rgba(255,255,255,0.95)", glow: "rgba(255,255,255,0.35)", blur: 18 },
  { stroke: "rgba(0,180,255,0.95)", glow: "rgba(0,150,255,0.28)", blur: 22 },
  { stroke: "rgba(0,90,200,0.90)", glow: "rgba(0,100,255,0.25)", blur: 25 }
];

const hexes = [];
const flows = [];
const clickFlows = []; // new array for click-generated flows
let shimmer = 0;
let pulseTimer = 0;
let pulseActive = false;
let lastTime = performance.now();
let frameCount = 0;
let fps = 60;
let lastFpsUpdate = performance.now();

// Shock wave variables
let shockWaves = [];
let nextShockTime = Date.now() + 3000; // First shock after 3 seconds

function resizeCanvas() {
  // cap DPR to reduce workload on high-DPI screens
  const rawDpr = window.devicePixelRatio || 1;
  const dpr = Math.min(rawDpr, 1.5);
  
  // Use full document height to cover entire scrollable area
  const width = window.innerWidth;
  const height = Math.max(
    window.innerHeight, 
    document.documentElement.scrollHeight,
    document.body.scrollHeight,
    document.documentElement.offsetHeight,
    document.body.offsetHeight,
    2000 // Minimum height to ensure coverage
  );
  
  console.log('Canvas height:', height, 'Document scroll height:', document.documentElement.scrollHeight);
  
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  hexes.length = 0;
  flows.length = 0;
  clickFlows.length = 0;
  generateGrid();

  // scale number of flows by viewport area to maintain consistent density
  const area = window.innerWidth * window.innerHeight;
  const targetLines = Math.max(6000, Math.floor(area * BASE_DENSITY)); // doubled from 3000

  for (let i = 0; i < targetLines; i++) {
    flows.push({
      hex: Math.floor(Math.random() * hexes.length),
      edge: Math.floor(Math.random() * 6),
      t: Math.random(),
      speed: BASE_SPEED * (0.6 + Math.random() * 1.4),
      colorIndex: i % COLORS.length,
      isClickFlow: false,
      createdAt: Date.now()
    });
  }
}

window.addEventListener("resize", resizeCanvas);
window.addEventListener("scroll", () => {
  // Always recalculate on scroll to ensure full coverage
  resizeCanvas();
});

// ResizeObserver to handle dynamic content changes
const resizeObserver = new ResizeObserver(() => {
  resizeCanvas();
});
resizeObserver.observe(document.body);
resizeObserver.observe(document.documentElement);

// Also check periodically for content changes
setInterval(() => {
  const currentHeight = Math.max(
    window.innerHeight, 
    document.documentElement.scrollHeight,
    document.body.scrollHeight
  );
  const canvasHeight = parseInt(canvas.style.height) || 0;
  if (Math.abs(canvasHeight - currentHeight) > 50) {
    resizeCanvas();
  }
}, 1000);

// Mouse click burst feature
canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  // Create burst of new flows at click position
  const burstCount = 12 + Math.floor(Math.random() * 8);
  const clickTime = Date.now();
  
  for (let i = 0; i < burstCount; i++) {
    // Find nearest hex to click position
    let minDist = Infinity;
    let nearestHex = 0;
    
    for (let j = 0; j < hexes.length; j++) {
      const hex = hexes[j];
      const centerX = hex.reduce((sum, v) => sum + v.x, 0) / 6;
      const centerY = hex.reduce((sum, v) => sum + v.y, 0) / 6;
      const dist = Math.sqrt((centerX - x) ** 2 + (centerY - y) ** 2);
      
      if (dist < minDist) {
        minDist = dist;
        nearestHex = j;
      }
    }
    
    clickFlows.push({
      hex: nearestHex,
      edge: Math.floor(Math.random() * 6),
      t: Math.random(),
      speed: BASE_SPEED * (2.0 + Math.random() * 2.0), // faster for click flows
      colorIndex: Math.floor(Math.random() * COLORS.length),
      isClickFlow: true,
      createdAt: clickTime,
      burstIntensity: 1.0
    });
  }
});

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

  // Use canvas height instead of window.innerHeight to cover full area
  const canvasHeight = canvas.height || 2000;
  const canvasWidth = canvas.width || window.innerWidth;

  for (let y = -h; y < canvasHeight + h; y += step) {
    const offset = row % 2 ? w / 2 : 0;
    for (let x = -w; x < canvasWidth + w; x += w) {
      hexes.push(hexVertices(x + offset, y, HEX_SIZE));
    }
    row++;
  }
  
  console.log('Generated', hexes.length, 'hexagons for canvas size:', canvasWidth, 'x', canvasHeight);
}

// Create shock wave at random position
function createShockWave() {
  const centerX = Math.random() * canvas.width;
  const centerY = Math.random() * canvas.height;
  
  shockWaves.push({
    x: centerX,
    y: centerY,
    radius: 0,
    maxRadius: 300 + Math.random() * 200,
    speed: 150 + Math.random() * 100, // pixels per second
    opacity: 1,
    color: COLORS[Math.floor(Math.random() * COLORS.length)]
  });
  
  // Schedule next shock wave
  nextShockTime = Date.now() + 2000 + Math.random() * 3000; // 2-5 seconds interval
}

function animate(now) {
  // time delta in seconds, capped for stability
  const dt = Math.min(0.04, (now - lastTime) / 1000);
  lastTime = now;

  // FPS monitoring
  frameCount++;
  if (now - lastFpsUpdate > 1000) {
    fps = frameCount;
    frameCount = 0;
    lastFpsUpdate = now;
  }

  // Optimized trail fade with less opacity change for performance
  ctx.fillStyle = 'rgba(4,10,20,0.15)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  shimmer += dt * 1.8;

  // Create shock waves periodically
  if (Date.now() > nextShockTime) {
    createShockWave();
  }

  // Update shock waves
  for (let i = shockWaves.length - 1; i >= 0; i--) {
    const wave = shockWaves[i];
    wave.radius += wave.speed * dt;
    wave.opacity = Math.max(0, 1 - (wave.radius / wave.maxRadius));
    
    // Remove completed shock waves
    if (wave.radius > wave.maxRadius) {
      shockWaves.splice(i, 1);
    }
  }

  // Enhanced shock pulse logic - more frequent and dramatic
  pulseTimer += dt;
  if (pulseTimer > 2.0 + Math.random() * 1.5) {
    pulseTimer = 0;
    pulseActive = true;
  }
  if (pulseActive) {
    if (pulseTimer > 0.3) pulseActive = false;
  }

  // Remove old click flows (older than 15 seconds)
  const currentTime = Date.now();
  for (let i = clickFlows.length - 1; i >= 0; i--) {
    if (currentTime - clickFlows[i].createdAt > 15000) {
      clickFlows.splice(i, 1);
    }
  }

  // Combine all flows for batch processing
  const allFlows = [...flows, ...clickFlows];
  
  // Batch draws by color to reduce state changes
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const flowsByColor = {};
  
  for (let i = 0; i < allFlows.length; i++) {
    const f = allFlows[i];
    (flowsByColor[f.colorIndex] = flowsByColor[f.colorIndex] || []).push(f);
  }

  ctx.globalCompositeOperation = 'lighter';

  for (const colorIndexStr in flowsByColor) {
    const colorIndex = Number(colorIndexStr);
    const col = COLORS[colorIndex];
    ctx.strokeStyle = col.stroke;
    ctx.shadowColor = col.glow;
    ctx.shadowBlur = col.blur * 0.75;
    ctx.lineWidth = allFlows[0].isClickFlow ? 1.8 : 1.2;

    const list = flowsByColor[colorIndex];
    ctx.beginPath();
    
    for (let i = 0; i < list.length; i++) {
      const f = list[i];
      
      // Enhanced shock multiplier for dramatic movement
      let shockMul = 1.0;
      
      // Apply shock wave effect to flows near shock waves
      for (const wave of shockWaves) {
        const h = hexes[f.hex];
        if (h) {
          const centerX = h.reduce((sum, v) => sum + v.x, 0) / 6;
          const centerY = h.reduce((sum, v) => sum + v.y, 0) / 6;
          const distance = Math.sqrt((centerX - wave.x) ** 2 + (centerY - wave.y) ** 2);
          
          // If hexagon is near the shock wave front
          if (Math.abs(distance - wave.radius) < 50) {
            const shockIntensity = wave.opacity * (1 - Math.abs(distance - wave.radius) / 50);
            shockMul = Math.max(shockMul, 1.0 + shockIntensity * 3.0); // Up to 4x speed boost
          }
        }
      }
      
      const pulseMul = pulseActive ? (2.5 + Math.random() * 1.5) : 1.0;
      const clickMul = f.isClickFlow ? (1.5 + f.burstIntensity * 0.5) : 1.0;
      
      f.t += f.speed * dt * pulseMul * clickMul * shockMul;
      if (f.t > 1) f.t -= 1;

      const h = hexes[f.hex];
      const a = h[f.edge];
      const b = h[(f.edge + 1) % 6];
      const eased = 0.5 - 0.5 * Math.cos(Math.PI * f.t);
      const x = a.x + (b.x - a.x) * eased;
      const y = a.y + (b.y - a.y) * eased;

      // Dynamic segment length based on flow type
      const segmentLength = f.isClickFlow ? 
        (0.2 + (pulseActive ? 0.15 : 0)) : 
        (0.34 + (pulseActive ? 0.18 : 0));
      
      const sx = a.x + (b.x - a.x) * Math.max(0, f.t - segmentLength);
      const sy = a.y + (b.y - a.y) * Math.max(0, f.t - segmentLength);
      
      ctx.moveTo(sx, sy);
      ctx.lineTo(x, y);
      
      // Decay burst intensity for click flows
      if (f.isClickFlow && f.burstIntensity > 0.1) {
        f.burstIntensity *= 0.98;
      }
    }
    ctx.stroke();
  }

  // Render shock waves
  ctx.globalCompositeOperation = 'lighter';
  for (const wave of shockWaves) {
    ctx.strokeStyle = wave.color.stroke;
    ctx.shadowColor = wave.color.glow;
    ctx.shadowBlur = wave.color.blur * wave.opacity;
    ctx.lineWidth = 2 * wave.opacity;
    ctx.globalAlpha = wave.opacity * 0.6;
    
    ctx.beginPath();
    ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Add inner ring for more dramatic effect
    if (wave.radius > 20) {
      ctx.globalAlpha = wave.opacity * 0.3;
      ctx.lineWidth = 1 * wave.opacity;
      ctx.beginPath();
      ctx.arc(wave.x, wave.y, wave.radius - 10, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';

  requestAnimationFrame(animate);
}

resizeCanvas();
requestAnimationFrame(animate);
