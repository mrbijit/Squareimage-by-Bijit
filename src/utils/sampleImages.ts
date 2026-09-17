export function generateSampleImage(
  width: number,
  height: number,
  title: string,
  gradientStart: string,
  gradientEnd: string,
  typeText: string
): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, gradientStart);
    grad.addColorStop(1, gradientEnd);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Subtle decorative grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 40; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 40; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Mountain/Landscape geometry
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(width * 0.25, height * 0.45);
    ctx.lineTo(width * 0.5, height * 0.75);
    ctx.lineTo(width * 0.75, height * 0.35);
    ctx.lineTo(width, height * 0.8);
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();

    // Sun / circle
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(width * 0.8, height * 0.25, Math.min(width, height) * 0.12, 0, Math.PI * 2);
    ctx.fill();

    // Text label
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const fontSize = Math.max(16, Math.min(width, height) * 0.06);
    ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillText(title, width / 2, height / 2 - fontSize * 0.6);

    ctx.font = `500 ${fontSize * 0.55}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fillText(`${width} × ${height} (${typeText})`, width / 2, height / 2 + fontSize * 0.8);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `${title.toLowerCase().replace(/\s+/g, '_')}.jpg`, {
          type: 'image/jpeg',
        });
        resolve(file);
      }
    }, 'image/jpeg', 0.95);
  });
}

export async function createSampleImagesList(): Promise<File[]> {
  const samples = await Promise.all([
    // 16:9 Landscape
    generateSampleImage(1920, 1080, 'Scenic Horizon', '#0284c7', '#4f46e5', '16:9 Landscape'),
    // 9:16 Portrait
    generateSampleImage(1080, 1920, 'Vertical Bloom', '#ec4899', '#8b5cf6', '9:16 Portrait'),
    // 21:9 Ultra-wide Panorama
    generateSampleImage(1680, 720, 'Panorama Coast', '#0d9488', '#0284c7', '21:9 Wide'),
  ]);
  return samples;
}
