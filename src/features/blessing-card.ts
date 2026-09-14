function wrapText(ctx: CanvasRenderingContext2D, text: string, max: number) {
  const lines: string[] = []; let line = '';
  for (const word of text.split(/\s+/)) {
    // Split even long unbroken input so a private intention stays inside the card.
    for (const char of word + ' ') {
      if (ctx.measureText(line + char).width > max) { lines.push(line.trim()); line = ''; }
      line += char;
    }
  }
  if (line.trim()) lines.push(line.trim());
  return lines;
}

export async function downloadBlessingCard(intention?: string) {
  await document.fonts.ready;
  const canvas = document.createElement('canvas'); canvas.width = 1200; canvas.height = 1500;
  const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('Canvas is unavailable');
  const bg = ctx.createRadialGradient(600, 450, 50, 600, 650, 1000); bg.addColorStop(0, '#392a19'); bg.addColorStop(1, '#100c09');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, 1200, 1500);
  ctx.strokeStyle = '#8e6a3f'; ctx.lineWidth = 1; ctx.strokeRect(48, 48, 1104, 1404); ctx.strokeStyle = '#5b432a'; ctx.strokeRect(61, 61, 1078, 1378);
  ctx.save(); ctx.translate(600, 400); ctx.strokeStyle = '#b7915245';
  for (const radius of [150, 160, 204, 216]) { ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI * 2); ctx.stroke(); }
  for (let i = 0; i < 32; i++) { ctx.save(); ctx.rotate(i * Math.PI / 16); ctx.beginPath(); ctx.moveTo(0, -163); ctx.quadraticCurveTo(25, -186, 0, -204); ctx.quadraticCurveTo(-25, -186, 0, -163); ctx.stroke(); ctx.restore(); }
  ctx.fillStyle = '#cc9e5a'; ctx.beginPath(); ctx.moveTo(-77, 28); ctx.quadraticCurveTo(0, 142, 77, 28); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#f4d49a'; ctx.shadowColor = '#e9a53e'; ctx.shadowBlur = 40; ctx.beginPath(); ctx.moveTo(0, -90); ctx.bezierCurveTo(55, -23, 29, 13, 0, 16); ctx.bezierCurveTo(-35, 4, -31, -37, 0, -90); ctx.fill(); ctx.restore();
  ctx.textAlign = 'center'; ctx.fillStyle = '#c8a575'; ctx.font = '500 20px "DM Sans"'; ctx.fillText('A LITTLE LIGHT. A NEW BEGINNING.', 600, 130);
  ctx.fillStyle = '#f1e4ce'; ctx.font = '400 70px "Cormorant Garamond"';
  ['May Lord Ganesha remove', 'every obstacle', 'from your path.'].forEach((line, i) => ctx.fillText(line, 600, 760 + i * 82));
  ctx.strokeStyle = '#bd9252'; ctx.beginPath(); ctx.moveTo(550, 1000); ctx.lineTo(650, 1000); ctx.stroke();
  ctx.fillStyle = '#d6b781'; ctx.font = '400 46px "Cormorant Garamond"'; ctx.fillText('Happy Ganesh Chaturthi', 600, 1080);
  if (intention) {
    ctx.fillStyle = '#bca58a'; ctx.font = '400 24px "DM Sans"';
    const lines = wrapText(ctx, intention, 880).slice(0, 5);
    lines.forEach((line, i) => ctx.fillText(line, 600, 1170 + i * 34));
  } else {
    ctx.fillStyle = '#a28a6a'; ctx.font = '400 27px "Cormorant Garamond"'; ctx.fillText('Carry a little peace into your next beginning.', 600, 1200);
  }
  ctx.fillStyle = '#9c7c52'; ctx.font = '500 17px "DM Sans"'; ctx.fillText('GANESH · THE REMOVER OF OBSTACLES', 600, 1380);
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error('Image export failed')), 'image/png'));
  const url = URL.createObjectURL(blob), link = document.createElement('a'); link.href = url; link.download = 'a-blessing-from-ganesh.png'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 30000);
}
