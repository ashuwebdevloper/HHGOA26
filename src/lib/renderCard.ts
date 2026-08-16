import { EVENT } from './constants';
import { drawImageCover, roundRect } from './image';
import { aestheticPhoto } from './photoFX';

// Vintage travel-ticket / boarding-pass builder ID card.
// Renders at 1600x900 to match the reference SVG artwork.
export function renderCard(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  name: string,
  stack: string,
  title: string,
): void {
  const W = 1600;
  const H = 900;
  ctx.clearRect(0, 0, W, H);
  const S = W / 1600; // scale factor (1 at native)

  ctx.save();
  // Clip to rounded frame
  roundRect(ctx, 0, 0, W, H, 6 * S);
  ctx.clip();

  // ── Paper background ──
  ctx.fillStyle = '#f2e8d5';
  ctx.fillRect(0, 0, W, H);
  drawPaperTexture(ctx, W, H, S);

  // ── Top diagonal stripe border ──
  drawDiagStripe(ctx, 0, 0, W, 26 * S, S);
  ctx.fillStyle = '#1f4d2c';
  ctx.fillRect(0, 26 * S, W, 2 * S);

  // ── Left vertical margin ──
  ctx.fillStyle = '#1f4d2c';
  ctx.fillRect(0, 28 * S, 72 * S, 872 * S);
  ctx.fillStyle = '#c23a5e';
  ctx.fillRect(72 * S, 28 * S, 4 * S, 872 * S);

  // Stars in left margin
  [60, 300, 540, 780].forEach((y) => drawStar(ctx, 36 * S, y * S, 14 * S, '#e0563f'));

  // Vertical "ENTRY PERMIT" text
  ctx.fillStyle = '#f2e8d5';
  ctx.font = `700 ${15 * S}px "Courier New", monospace`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  [120, 360, 600, 840].forEach((y) => {
    ctx.save();
    ctx.translate(48 * S, y * S);
    ctx.rotate(Math.PI / 2);
    ctx.fillText('ENTRY PERMIT', 0, 0);
    ctx.restore();
  });

  // ── Left polaroid photo frame ──
  const polX = 115 * S, polY = 80 * S, polW = 330 * S, polH = 470 * S;
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#1f4d2c';
  ctx.lineWidth = 4 * S;
  roundRect(ctx, polX, polY, polW, polH, 10 * S);
  ctx.fill();
  ctx.stroke();

  // Photo area inside polaroid
  const photoX = polX + 20 * S, photoY = polY + 20 * S;
  const photoW = polW - 40 * S, photoH = 360 * S;
  ctx.fillStyle = '#eef0ea';
  ctx.strokeStyle = '#1f4d2c';
  ctx.lineWidth = 1.5 * S;
  ctx.fillRect(photoX, photoY, photoW, photoH);
  ctx.strokeRect(photoX, photoY, photoW, photoH);

  // Draw the user's photo with aesthetic grade
  ctx.save();
  roundRect(ctx, photoX, photoY, photoW, photoH, 2 * S);
  ctx.clip();
  aestheticPhoto(ctx, img, photoX, photoY, photoW, photoH, 2 * S, 1.06);
  ctx.restore();

  // Crop marks at polaroid corners
  ctx.strokeStyle = '#1f4d2c';
  ctx.lineWidth = 2 * S;
  drawCropMark(ctx, polX, polY, 20 * S, 'tl');
  drawCropMark(ctx, polX + polW, polY, 20 * S, 'tr');
  drawCropMark(ctx, polX, polY + polH, 20 * S, 'bl');
  drawCropMark(ctx, polX + polW, polY + polH, 20 * S, 'br');

  // Polaroid labels
  ctx.fillStyle = '#1f4d2c';
  ctx.font = `700 ${15 * S}px "Courier New", monospace`;
  ctx.textAlign = 'center';
  ctx.fillText('DELEGATE PHOTO', polX + polW / 2, polY + 420 * S);
  ctx.fillStyle = '#6f6c5e';
  ctx.font = `${12 * S}px "Courier New", monospace`;
  ctx.fillText('ATTACH BELOW', polX + polW / 2, polY + 444 * S);

  // ── Coconut + cursor icons bottom-left ──
  drawCoconut(ctx, 140 * S, 600 * S, S);
  drawCursor(ctx, 215 * S, 608 * S, S);

  // ── "BUILT IN GOA / SHIPPED WORLDWIDE" badge ──
  ctx.strokeStyle = '#c23a5e';
  ctx.lineWidth = 2 * S;
  ctx.setLineDash([6 * S, 5 * S]);
  roundRect(ctx, 140 * S, 660 * S, 300 * S, 66 * S, 6 * S);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#1f4d2c';
  ctx.font = `700 ${15 * S}px "Courier New", monospace`;
  ctx.fillText('BUILT IN GOA', 290 * S, 688 * S);
  ctx.fillStyle = '#c23a5e';
  ctx.fillText('SHIPPED WORLDWIDE', 290 * S, 708 * S);

  // ── Center artwork: villa scene ──
  drawVillaScene(ctx, 470 * S, 60 * S, S);

  // ── Title (name + '26) below villa ──
  const displayName = (name || 'YOUR NAME').toUpperCase();
  ctx.font = `700 ${52 * S}px Georgia, serif`;
  ctx.textAlign = 'end';
  ctx.fillStyle = '#1f4d2c';
  ctx.fillText(fitText(ctx, displayName, 560 * S, `700 ${52 * S}px Georgia, serif`), 800 * S, 600 * S);
  ctx.textAlign = 'start';
  ctx.fillStyle = '#c23a5e';
  ctx.fillText("'26", 812 * S, 600 * S);

  // ── Dashed subtitle divider ──
  ctx.strokeStyle = '#1f4d2c';
  ctx.lineWidth = 2 * S;
  ctx.setLineDash([6 * S, 5 * S]);
  ctx.beginPath();
  ctx.moveTo(500 * S, 645 * S);
  ctx.lineTo(620 * S, 645 * S);
  ctx.moveTo(980 * S, 645 * S);
  ctx.lineTo(1100 * S, 645 * S);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#1f4d2c';
  ctx.font = `700 ${18 * S}px "Courier New", monospace`;
  ctx.textAlign = 'center';
  ctx.fillText('» BUILD • DEPLOY • REPEAT «', 800 * S, 652 * S);

  // ── Vertical divider ──
  ctx.strokeStyle = '#1f4d2c';
  ctx.lineWidth = 2 * S;
  ctx.setLineDash([8 * S, 6 * S]);
  ctx.beginPath();
  ctx.moveTo(1090 * S, 60 * S);
  ctx.lineTo(1090 * S, 800 * S);
  ctx.stroke();
  ctx.setLineDash([]);
  // Divider end caps
  ctx.fillStyle = '#f6ecd6';
  ctx.strokeStyle = '#1f4d2c';
  ctx.lineWidth = 1.5 * S;
  [60, 800].forEach((y) => {
    ctx.beginPath();
    ctx.arc(1090 * S, y * S, 9 * S, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  // ── Right side: boarding pass ──
  drawBoardingPass(ctx, 1120 * S, 70 * S, S, name, stack, title);

  // ── Bottom footer strip ──
  ctx.fillStyle = '#1f4d2c';
  ctx.fillRect(0, 826 * S, W, 74 * S);
  drawFooter(ctx, S);

  // ── Outer frame ──
  ctx.strokeStyle = '#1f4d2c';
  ctx.lineWidth = 3 * S;
  ctx.strokeRect(4 * S, 4 * S, 1592 * S, 892 * S);

  ctx.restore();
}

/* ── Paper texture (subtle dots) ── */
function drawPaperTexture(ctx: CanvasRenderingContext2D, W: number, H: number, S: number): void {
  ctx.fillStyle = '#e7d9ba';
  for (let y = 0; y < H; y += 6 * S) {
    for (let x = 0; x < W; x += 6 * S) {
      ctx.globalAlpha = 0.25;
      ctx.beginPath();
      ctx.arc(x + 1 * S, y + 1 * S, 0.4 * S, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + 4 * S, y + 3 * S, 0.3 * S, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

/* ── Diagonal pink/yellow stripe ── */
function drawDiagStripe(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, S: number): void {
  const stripeW = 14 * S;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.translate(x, y);
  ctx.rotate(Math.atan2(h, w));
  for (let i = -h; i < w + h; i += stripeW * 2) {
    ctx.fillStyle = '#e6467a';
    ctx.fillRect(i, -h, stripeW, h * 3);
    ctx.fillStyle = '#f3c94a';
    ctx.fillRect(i + stripeW, -h, stripeW, h * 3);
  }
  ctx.restore();
}

/* ── 5-point star ── */
function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const outerAngle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
    const innerAngle = outerAngle + Math.PI / 5;
    ctx.lineTo(cx + Math.cos(outerAngle) * r, cy + Math.sin(outerAngle) * r);
    ctx.lineTo(cx + Math.cos(innerAngle) * r * 0.4, cy + Math.sin(innerAngle) * r * 0.4);
  }
  ctx.closePath();
  ctx.fill();
}

/* ── Crop marks ── */
function drawCropMark(ctx: CanvasRenderingContext2D, x: number, y: number, len: number, corner: 'tl' | 'tr' | 'bl' | 'br'): void {
  ctx.beginPath();
  if (corner === 'tl') { ctx.moveTo(x, y - len); ctx.lineTo(x, y); ctx.lineTo(x - len, y); }
  if (corner === 'tr') { ctx.moveTo(x, y - len); ctx.lineTo(x, y); ctx.lineTo(x + len, y); }
  if (corner === 'bl') { ctx.moveTo(x, y + len); ctx.lineTo(x, y); ctx.lineTo(x - len, y); }
  if (corner === 'br') { ctx.moveTo(x, y + len); ctx.lineTo(x, y); ctx.lineTo(x + len, y); }
  ctx.stroke();
}

/* ── Coconut icon ── */
function drawCoconut(ctx: CanvasRenderingContext2D, x: number, y: number, S: number): void {
  ctx.fillStyle = '#5a3a24';
  ctx.beginPath();
  ctx.ellipse(x + 30 * S, y + 30 * S, 22 * S, 20 * S, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#7a5236';
  ctx.beginPath();
  ctx.ellipse(x + 30 * S, y + 30 * S, 14 * S, 12 * S, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.translate(x + 28 * S, y + 14 * S);
  ctx.rotate((20 * Math.PI) / 180);
  ctx.fillStyle = '#639922';
  ctx.fillRect(-2.5 * S, 0, 5 * S, 20 * S);
  ctx.restore();
}

/* ── Cursor arrow icon ── */
function drawCursor(ctx: CanvasRenderingContext2D, x: number, y: number, S: number): void {
  ctx.fillStyle = '#1f4d2c';
  ctx.strokeStyle = '#1f4d2c';
  ctx.lineWidth = S;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + 38 * S);
  ctx.lineTo(x + 10 * S, y + 28 * S);
  ctx.lineTo(x + 17 * S, y + 42 * S);
  ctx.lineTo(x + 23 * S, y + 38 * S);
  ctx.lineTo(x + 16 * S, y + 24 * S);
  ctx.lineTo(x + 29 * S, y + 24 * S);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

/* ── Villa scene (center artwork) ── */
function drawVillaScene(ctx: CanvasRenderingContext2D, ox: number, oy: number, S: number): void {
  ctx.save();
  ctx.translate(ox, oy);

  // Sky wash
  ctx.fillStyle = '#f6ecd6';
  ctx.fillRect(0, 0, 600 * S, 360 * S);

  // Palm trees (left)
  drawPalmTree(ctx, 30 * S, 120 * S, S, 10, true);
  // Palm trees (right)
  drawPalmTree(ctx, 540 * S, 100 * S, S, 9, false);

  // Villa
  drawVilla(ctx, 150 * S, 90 * S, S);

  // Bougainvillea
  ctx.fillStyle = '#e0567e';
  [[150, 230], [164, 225], [140, 220], [450, 235], [464, 228], [438, 222], [470, 245], [130, 240]].forEach(([cx, cy]) => {
    ctx.beginPath();
    ctx.arc(cx * S, cy * S, 6 * S, 0, Math.PI * 2);
    ctx.fill();
  });
  // Green leaves
  ctx.fillStyle = '#2f6b3a';
  ctx.beginPath();
  ctx.moveTo(140 * S, 260 * S);
  ctx.quadraticCurveTo(150 * S, 230 * S, 160 * S, 250 * S);
  ctx.quadraticCurveTo(170 * S, 225 * S, 175 * S, 255 * S);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(440 * S, 265 * S);
  ctx.quadraticCurveTo(450 * S, 235 * S, 460 * S, 255 * S);
  ctx.quadraticCurveTo(470 * S, 240 * S, 475 * S, 260 * S);
  ctx.closePath();
  ctx.fill();

  // Ground shrubs
  ctx.fillStyle = '#3b7a3f';
  ctx.beginPath();
  ctx.ellipse(90 * S, 270 * S, 45 * S, 14 * S, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(510 * S, 272 * S, 45 * S, 14 * S, 0, 0, Math.PI * 2);
  ctx.fill();

  // Flight tag sticker (top-left, rotated)
  ctx.save();
  ctx.translate(120 * S, 20 * S);
  ctx.rotate((-8 * Math.PI) / 180);
  ctx.fillStyle = '#eef0ea';
  ctx.strokeStyle = '#1f4d2c';
  ctx.lineWidth = 2.5 * S;
  roundRect(ctx, 0, 0, 120 * S, 46 * S, 4 * S);
  ctx.fill();
  ctx.stroke();
  // Clock circle
  ctx.strokeStyle = '#c23a5e';
  ctx.lineWidth = 2.5 * S;
  ctx.beginPath();
  ctx.arc(18 * S, 23 * S, 9 * S, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 2 * S;
  ctx.beginPath();
  ctx.moveTo(18 * S, 16 * S); ctx.lineTo(18 * S, 23 * S);
  ctx.moveTo(18 * S, 23 * S); ctx.lineTo(23 * S, 27 * S);
  ctx.stroke();
  ctx.fillStyle = '#1f4d2c';
  ctx.font = `700 ${12 * S}px "Courier New", monospace`;
  ctx.textAlign = 'left';
  ctx.fillText('+ GOA', 34 * S, 18 * S);
  ctx.fillText('INDIA', 34 * S, 34 * S);
  ctx.restore();

  // Postal rubber stamp (top-right)
  drawPostalStamp(ctx, 460 * S, 10 * S, S);

  ctx.restore();
}

/* ── Palm tree ── */
function drawPalmTree(ctx: CanvasRenderingContext2D, x: number, y: number, S: number, trunkW: number, leftLean: boolean): void {
  ctx.save();
  ctx.translate(x, y);
  // Trunk
  ctx.fillStyle = '#6b4a2b';
  ctx.fillRect(18 * S, 60 * S, trunkW * S, 150 * S);
  // Fronds
  ctx.fillStyle = '#2f6b3a';
  const cx = 23 * S, cy = 60 * S;
  const fronds = leftLean
    ? [[-55, 40, -20, 55, 0, 65], [95, 25, 65, 45, 45, 60], [-25, -10, -5, 15, 5, 40], [75, -10, 55, 15, 40, 40], [15, -30, 23, -15, 25, 10]]
    : [[-55, 55, -25, 65, 0, 72], [75, 40, 48, 55, 30, 68], [-22, 0, -5, 20, 3, 45], [48, 0, 32, 20, 22, 45]];
  fronds.forEach(([ex, ey, mx, my, lx, ly]) => {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.quadraticCurveTo(mx * S, my * S, ex * S, ey * S);
    ctx.quadraticCurveTo((mx + 10) * S, (my + 8) * S, lx * S, ly * S);
    ctx.closePath();
    ctx.fill();
  });
  ctx.restore();
}

/* ── Villa building ── */
function drawVilla(ctx: CanvasRenderingContext2D, x: number, y: number, S: number): void {
  ctx.save();
  ctx.translate(x, y);
  // Walls
  ctx.fillStyle = '#faf6ec';
  ctx.strokeStyle = '#1f4d2c';
  ctx.lineWidth = 3 * S;
  ctx.fillRect(0, 70 * S, 300 * S, 150 * S);
  ctx.strokeRect(0, 70 * S, 300 * S, 150 * S);
  // Roof
  ctx.fillStyle = '#a8452c';
  ctx.beginPath();
  ctx.moveTo(-20 * S, 70 * S);
  ctx.lineTo(150 * S, 10 * S);
  ctx.lineTo(320 * S, 70 * S);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Roof tiles
  ctx.strokeStyle = '#7c3220';
  ctx.lineWidth = 1.5 * S;
  [55, 42, 30].forEach((yy) => {
    ctx.beginPath();
    ctx.moveTo(0, yy * S);
    ctx.lineTo(300 * S, yy * S);
    ctx.stroke();
  });
  // Balcony
  ctx.fillStyle = '#eef0ea';
  ctx.strokeStyle = '#1f4d2c';
  ctx.lineWidth = 2.5 * S;
  ctx.fillRect(90 * S, 110 * S, 120 * S, 60 * S);
  ctx.strokeRect(90 * S, 110 * S, 120 * S, 60 * S);
  ctx.lineWidth = 2 * S;
  [100, 120, 140, 160, 180, 200].forEach((xx) => {
    ctx.beginPath();
    ctx.moveTo(xx * S, 110 * S);
    ctx.lineTo(xx * S, 170 * S);
    ctx.stroke();
  });
  ctx.fillStyle = '#1f4d2c';
  ctx.fillRect(90 * S, 105 * S, 120 * S, 8 * S);
  // Shutters
  ctx.fillStyle = '#eef0ea';
  ctx.strokeStyle = '#1f4d2c';
  ctx.lineWidth = 2 * S;
  ctx.fillRect(20 * S, 120 * S, 35 * S, 55 * S);
  ctx.strokeRect(20 * S, 120 * S, 35 * S, 55 * S);
  ctx.fillStyle = '#2f6b3a';
  ctx.fillRect(20 * S, 120 * S, 17 * S, 55 * S);
  ctx.fillStyle = '#eef0ea';
  ctx.fillRect(245 * S, 120 * S, 35 * S, 55 * S);
  ctx.strokeRect(245 * S, 120 * S, 35 * S, 55 * S);
  ctx.fillStyle = '#2f6b3a';
  ctx.fillRect(263 * S, 120 * S, 17 * S, 55 * S);
  // Door
  ctx.fillStyle = '#2f6b3a';
  ctx.strokeStyle = '#1f4d2c';
  ctx.lineWidth = 2.5 * S;
  ctx.fillRect(130 * S, 180 * S, 40 * S, 40 * S);
  ctx.strokeRect(130 * S, 180 * S, 40 * S, 40 * S);
  // Ground steps
  ctx.fillStyle = '#d8cba3';
  ctx.fillRect(-10 * S, 220 * S, 320 * S, 10 * S);
  ctx.restore();
}

/* ── Postal rubber stamp ── */
function drawPostalStamp(ctx: CanvasRenderingContext2D, x: number, y: number, S: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = '#c23a5e';
  ctx.lineWidth = 3 * S;
  ctx.setLineDash([4 * S, 3 * S]);
  ctx.beginPath();
  ctx.arc(60 * S, 60 * S, 56 * S, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.lineWidth = 2 * S;
  ctx.beginPath();
  ctx.arc(60 * S, 60 * S, 44 * S, 0, Math.PI * 2);
  ctx.stroke();
  // Curved "CODE" text along top arc
  ctx.fillStyle = '#c23a5e';
  ctx.font = `700 ${11.5 * S}px "Courier New", monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const codeText = 'CODE';
  const arcRadius = 44 * S;
  codeText.split('').forEach((ch, i) => {
    const angle = -Math.PI / 2 + (i - (codeText.length - 1) / 2) * 0.22;
    ctx.save();
    ctx.translate(60 * S + Math.cos(angle) * arcRadius, 60 * S + Math.sin(angle) * arcRadius);
    ctx.rotate(angle + Math.PI / 2);
    ctx.fillText(ch, 0, 0);
    ctx.restore();
  });
  ctx.fillText('CODE, SHIP,', 60 * S, 56 * S);
  ctx.fillText('REPEAT', 60 * S, 72 * S);
  // Wavy lines
  ctx.strokeStyle = '#c23a5e';
  ctx.lineWidth = 1.5 * S;
  [60, 68].forEach((yy) => {
    ctx.beginPath();
    ctx.moveTo(10 * S, yy * S);
    ctx.quadraticCurveTo(35 * S, (yy + 7) * S, 60 * S, yy * S);
    ctx.quadraticCurveTo(85 * S, (yy - 7) * S, 110 * S, yy * S);
    ctx.stroke();
  });
  ctx.restore();
}

/* ── Boarding pass (right side) ── */
function drawBoardingPass(ctx: CanvasRenderingContext2D, x: number, y: number, S: number, name: string, stack: string, title: string): void {
  ctx.save();
  ctx.translate(x, y);

  // Code icon
  ctx.fillStyle = '#1f4d2c';
  ctx.font = `700 ${22 * S}px "Courier New", monospace`;
  ctx.textAlign = 'end';
  ctx.fillText('</>', 420 * S, 16 * S);

  // Event type
  ctx.textAlign = 'left';
  ctx.fillStyle = '#6f6c5e';
  ctx.font = `700 ${14 * S}px "Courier New", monospace`;
  ctx.fillText('EVENT TYPE', 0, 14 * S);
  ctx.fillStyle = '#1f4d2c';
  ctx.font = `700 ${24 * S}px Georgia, serif`;
  ctx.fillText('TECH SUMMIT', 0, 40 * S);

  // Dashed separator
  ctx.strokeStyle = '#1f4d2c';
  ctx.lineWidth = 1.5 * S;
  ctx.setLineDash([4 * S, 4 * S]);
  ctx.beginPath();
  ctx.moveTo(0, 60 * S);
  ctx.lineTo(420 * S, 60 * S);
  ctx.stroke();
  ctx.setLineDash([]);

  // Data fields — name, stack, title, terminal
  const fields: Array<[string, string, string]> = [
    ['DATE', EVENT.dateLine.replace(/[·]/g, '').trim(), '#1f4d2c'],
    ['BUILDER', (name || 'YOUR NAME').toUpperCase(), '#1f4d2c'],
    ['PASS TYPE', 'DEVELOPER', '#c23a5e'],
    ['STACK', fitText(ctx, (stack || 'BUILDER').toUpperCase(), 380 * S, `700 ${19 * S}px "Courier New", monospace`), '#1f4d2c'],
    ['TITLE', fitText(ctx, (title || 'BUILDER').toUpperCase(), 380 * S, `700 ${16 * S}px "Courier New", monospace`), '#1f4d2c'],
  ];

  let fieldY = 92;
  fields.forEach(([label, value, color]) => {
    ctx.fillStyle = '#6f6c5e';
    ctx.font = `700 ${13 * S}px "Courier New", monospace`;
    ctx.fillText(label, 0, fieldY * S);
    ctx.fillStyle = color;
    ctx.font = label === 'TITLE' ? `700 ${16 * S}px "Courier New", monospace` : `700 ${19 * S}px "Courier New", monospace`;
    ctx.fillText(value, 0, (fieldY + 22) * S);
    fieldY += 58;
  });

  // Dashed separator before barcode
  ctx.strokeStyle = '#1f4d2c';
  ctx.lineWidth = 1.5 * S;
  ctx.setLineDash([4 * S, 4 * S]);
  ctx.beginPath();
  ctx.moveTo(0, 310 * S);
  ctx.lineTo(420 * S, 310 * S);
  ctx.stroke();
  ctx.setLineDash([]);

  // Barcode
  drawBarcode(ctx, 0, 330 * S, S);
  // Barcode number
  ctx.fillStyle = '#1f4d2c';
  ctx.font = `700 ${14 * S}px "Courier New", monospace`;
  ctx.textAlign = 'left';
  ctx.fillText(`★ HHG-26-${shortId(name)} ★`, 0, 412 * S);

  // Compass stamp
  drawCompass(ctx, 30 * S, 455 * S, S);

  // QR code (decorative)
  drawQRCode(ctx, 280 * S, 450 * S, S);
  ctx.fillStyle = '#1f4d2c';
  ctx.font = `700 ${12 * S}px "Courier New", monospace`;
  ctx.textAlign = 'center';
  ctx.fillText('SCAN TO REGISTER', 350 * S, 608 * S);

  ctx.restore();
}

/* ── Barcode ── */
function drawBarcode(ctx: CanvasRenderingContext2D, x: number, y: number, S: number): void {
  const bars = [3, 2, 4, 2, 3, 5, 2, 3, 4, 2, 3, 5, 2, 4, 3, 2, 4, 3, 5, 2, 3, 4, 2, 5, 3, 2, 4, 3, 2, 5, 3, 4, 2, 3, 5, 2, 4, 3, 2, 5, 3, 4, 2, 3, 5, 2, 4, 3];
  ctx.fillStyle = '#1f4d2c';
  let cursor = x;
  bars.forEach((w) => {
    ctx.fillRect(cursor, y, w * S, 60 * S);
    cursor += (w + 3) * S;
  });
}

/* ── Compass stamp ── */
function drawCompass(ctx: CanvasRenderingContext2D, x: number, y: number, S: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = '#1f4d2c';
  ctx.lineWidth = 2.5 * S;
  ctx.setLineDash([3 * S, 3 * S]);
  ctx.beginPath();
  ctx.arc(60 * S, 60 * S, 56 * S, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.lineWidth = 1.5 * S;
  ctx.beginPath();
  ctx.arc(60 * S, 60 * S, 42 * S, 0, Math.PI * 2);
  ctx.stroke();
  // Crosshair
  ctx.beginPath();
  ctx.moveTo(60 * S, 26 * S); ctx.lineTo(60 * S, 94 * S);
  ctx.moveTo(26 * S, 60 * S); ctx.lineTo(94 * S, 60 * S);
  ctx.stroke();
  // Compass needle
  ctx.strokeStyle = '#c23a5e';
  ctx.lineWidth = 2.5 * S;
  ctx.lineCap = 'square';
  ctx.beginPath();
  ctx.rect(52 * S, 44 * S, 16 * S, 16 * S);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(56 * S, 40 * S); ctx.lineTo(56 * S, 48 * S);
  ctx.moveTo(64 * S, 48 * S); ctx.lineTo(56 * S, 48 * S);
  ctx.stroke();
  ctx.lineCap = 'butt';
  // Labels
  ctx.fillStyle = '#1f4d2c';
  ctx.font = `700 ${10 * S}px "Courier New", monospace`;
  ctx.textAlign = 'center';
  ctx.fillText('DEPART CODE', 60 * S, 98 * S);
  ctx.fillText('ARRIVE IMPACT', 60 * S, 15 * S);
  ctx.restore();
}

/* ── Decorative QR code ── */
function drawQRCode(ctx: CanvasRenderingContext2D, x: number, y: number, S: number): void {
  const size = 140;
  ctx.fillStyle = '#faf6ec';
  ctx.strokeStyle = '#1f4d2c';
  ctx.lineWidth = 2 * S;
  ctx.fillRect(x, y, size * S, size * S);
  ctx.strokeRect(x, y, size * S, size * S);

  ctx.fillStyle = '#1f4d2c';
  // Finder squares
  [[10, 10], [100, 10], [10, 100]].forEach(([fx, fy]) => {
    ctx.fillRect((fx) * S + x, (fy) * S + y, 30 * S, 30 * S);
    ctx.fillStyle = '#faf6ec';
    ctx.fillRect((fx + 7) * S + x, (fy + 7) * S + y, 16 * S, 16 * S);
    ctx.fillStyle = '#1f4d2c';
    ctx.fillRect((fx + 12) * S + x, (fy + 12) * S + y, 6 * S, 6 * S);
  });
  // Random data dots
  const dots = [[50, 14], [62, 14], [74, 20], [50, 30], [68, 30], [80, 30], [14, 50], [26, 56], [14, 68], [50, 50], [62, 56], [74, 50], [86, 62], [98, 56], [110, 68], [50, 80], [62, 86], [80, 80], [98, 86], [110, 98], [86, 98], [50, 104], [66, 110], [80, 104], [98, 116], [112, 112]];
  dots.forEach(([dx, dy]) => {
    ctx.fillRect(dx * S + x, dy * S + y, 6 * S, 6 * S);
  });
}

/* ── Bottom footer strip ── */
function drawFooter(ctx: CanvasRenderingContext2D, S: number): void {
  ctx.fillStyle = '#f2e8d5';
  ctx.font = `700 ${15 * S}px "Courier New", monospace`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  // Globe icon
  ctx.strokeStyle = '#f2e8d5';
  ctx.lineWidth = 2 * S;
  ctx.beginPath();
  ctx.arc(95 * S, 860 * S, 14 * S, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 1.5 * S;
  ctx.beginPath();
  ctx.ellipse(95 * S, 860 * S, 6 * S, 14 * S, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(81 * S, 860 * S); ctx.lineTo(109 * S, 860 * S);
  ctx.stroke();
  ctx.fillText('ONE CODEBASE. MANY DESTINATIONS.', 122 * S, 868 * S);

  // Briefcase icon
  ctx.lineWidth = 2 * S;
  ctx.beginPath();
  ctx.rect(560 * S, 856 * S, 30 * S, 20 * S);
  ctx.stroke();
  ctx.beginPath();
  ctx.rect(570 * S, 850 * S, 10 * S, 8 * S);
  ctx.stroke();
  ctx.fillText('HANDLE WITH CARE', 602 * S, 868 * S);

  // Heart icon
  ctx.fillStyle = '#e0567e';
  ctx.beginPath();
  ctx.moveTo(884 * S, 876 * S);
  ctx.bezierCurveTo(864 * S, 862 * S, 872 * S, 848 * S, 884 * S, 856 * S);
  ctx.bezierCurveTo(896 * S, 848 * S, 904 * S, 862 * S, 884 * S, 876 * S);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#f2c9d8';
  ctx.fillText('OPEN SOURCE AT HEART', 900 * S, 868 * S);

  // Hashtag
  ctx.fillStyle = '#f2e8d5';
  ctx.textAlign = 'end';
  ctx.fillText(EVENT.hashtag.toUpperCase(), 1520 * S, 868 * S);
}

/* ── Helpers ── */
function shortId(value: string): string {
  let total = 0;
  for (let index = 0; index < value.length; index++) total = (total + value.charCodeAt(index) * (index + 3)) % 10000;
  return total.toString().padStart(4, '0');
}

function fitText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, font: string): string {
  ctx.font = font;
  if (ctx.measureText(text).width <= maxWidth) return text;
  let value = text;
  while (value.length > 1 && ctx.measureText(`${value}…`).width > maxWidth) value = value.slice(0, -1);
  return `${value}…`;
}
