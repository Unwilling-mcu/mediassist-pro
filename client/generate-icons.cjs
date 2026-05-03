const { createCanvas } = require('canvas');
const fs   = require('fs');
const path = require('path');

const SIZES   = [72, 96, 128, 144, 152, 192, 384, 512];
const OUT_DIR = path.join(__dirname, 'public', 'icons');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

SIZES.forEach(size => {
  const canvas = createCanvas(size, size);
  const ctx    = canvas.getContext('2d');
  const r      = size * 0.22;

  // Gradient background
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, '#00D4A8');
  grad.addColorStop(1, '#4A9FD5');

  // Rounded rect
  ctx.beginPath();
  ctx.moveTo(r, 0); ctx.lineTo(size - r, 0);
  ctx.quadraticCurveTo(size, 0, size, r);
  ctx.lineTo(size, size - r);
  ctx.quadraticCurveTo(size, size, size - r, size);
  ctx.lineTo(r, size);
  ctx.quadraticCurveTo(0, size, 0, size - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // White plus symbol
  ctx.fillStyle = 'white';
  const thick = size * 0.16;
  const pad   = size * 0.20;
  // Vertical bar
  ctx.beginPath();
  ctx.roundRect(size/2 - thick/2, pad, thick, size - pad*2, thick/2);
  ctx.fill();
  // Horizontal bar
  ctx.beginPath();
  ctx.roundRect(pad, size/2 - thick/2, size - pad*2, thick, thick/2);
  ctx.fill();

  const file = path.join(OUT_DIR, `icon-${size}.png`);
  fs.writeFileSync(file, canvas.toBuffer('image/png'));
  console.log(`✅ Generated: icon-${size}.png`);
});

console.log('\n🎉 All PWA icons generated in public/icons/');
console.log('Now run: npm run build');
