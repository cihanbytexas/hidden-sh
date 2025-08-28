import { createCanvas, loadImage } from '@napi-rs/canvas';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { user1, user2, avatar1, avatar2 } = req.body;

  if (!user1 || !user2 || !avatar1 || !avatar2) {
    return res.status(400).json({ error: 'user1, user2, avatar1 and avatar2 required' });
  }

  const width = 600;
  const height = 250;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Arka plan gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#ffdde1');
  gradient.addColorStop(1, '#ee9ca7');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Avatarlar
  try {
    const img1 = await loadImage(avatar1);
    const img2 = await loadImage(avatar2);
    ctx.drawImage(img1, 20, 75, 100, 100);
    ctx.drawImage(img2, 480, 75, 100, 100);
  } catch (err) {
    console.error('Avatar yüklenemedi:', err);
  }

  // Ortada gölgeli kalp
  const heartX = width / 2;
  const heartY = height / 2;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 15;
  ctx.fillStyle = 'red';
  ctx.beginPath();
  ctx.moveTo(heartX, heartY - 30);
  ctx.bezierCurveTo(heartX - 50, heartY - 80, heartX - 50, heartY + 20, heartX, heartY + 30);
  ctx.bezierCurveTo(heartX + 50, heartY + 20, heartX + 50, heartY - 80, heartX, heartY - 30);
  ctx.fill();
  ctx.restore();

  // Random skor
  const score = Math.floor(Math.random() * 101);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 32px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${score}%`, heartX, heartY);

  // Kullanıcı isimleri
  ctx.fillStyle = '#000';
  ctx.font = 'bold 22px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(user1, 70, 200);
  ctx.fillText(user2, 530, 200);

  // PNG olarak gönder
  res.setHeader('Content-Type', 'image/png');
  res.status(200).send(await canvas.encode('png'));
}
