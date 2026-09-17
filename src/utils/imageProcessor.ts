import { ConversionSettings } from '../types';

export function calculateDimensions(
  origWidth: number,
  origHeight: number,
  settings: ConversionSettings
) {
  let squareSize: number;

  switch (settings.targetDimension) {
    case '1080':
      squareSize = 1080;
      break;
    case '1200':
      squareSize = 1200;
      break;
    case '2048':
      squareSize = 2048;
      break;
    case 'custom':
      squareSize = Math.max(64, Math.min(8192, settings.customSquareSize || 1080));
      break;
    case 'original-max':
    default:
      squareSize = Math.max(origWidth, origHeight);
      break;
  }

  // Margin/Padding
  const paddingRatio = Math.max(0, Math.min(0.5, settings.paddingPercent / 100));
  const availableDimension = squareSize * (1 - paddingRatio * 2);

  const scale = Math.min(
    availableDimension / origWidth,
    availableDimension / origHeight
  );

  const drawWidth = Math.round(origWidth * scale);
  const drawHeight = Math.round(origHeight * scale);
  const drawX = Math.round((squareSize - drawWidth) / 2);
  const drawY = Math.round((squareSize - drawHeight) / 2);

  return {
    squareSize,
    drawWidth,
    drawHeight,
    drawX,
    drawY,
    scale,
  };
}

export async function processImageTo1x1(
  imageSource: HTMLImageElement | ImageBitmap,
  settings: ConversionSettings
): Promise<{ blob: Blob; width: number; height: number }> {
  const origWidth = 'naturalWidth' in imageSource ? imageSource.naturalWidth : imageSource.width;
  const origHeight = 'naturalHeight' in imageSource ? imageSource.naturalHeight : imageSource.height;

  const { squareSize, drawWidth, drawHeight, drawX, drawY } = calculateDimensions(
    origWidth,
    origHeight,
    settings
  );

  const canvas = document.createElement('canvas');
  canvas.width = squareSize;
  canvas.height = squareSize;
  const ctx = canvas.getContext('2d', { willReadFrequently: false });

  if (!ctx) {
    throw new Error('Could not create canvas 2D rendering context.');
  }

  // High quality interpolation
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 1. Draw 1:1 Whiteboard Background
  if (settings.bgType === 'blur') {
    // Fill with blurred version of the image
    ctx.save();
    // Scale image to cover the square canvas
    const coverScale = Math.max(squareSize / origWidth, squareSize / origHeight);
    const cw = origWidth * coverScale;
    const ch = origHeight * coverScale;
    const cx = (squareSize - cw) / 2;
    const cy = (squareSize - ch) / 2;

    ctx.filter = 'blur(35px) brightness(0.95)';
    ctx.drawImage(imageSource, cx - 40, cy - 40, cw + 80, ch + 80);
    ctx.restore();

    // Subtle white tint over blur to maintain whiteboard lightness
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillRect(0, 0, squareSize, squareSize);
  } else if (settings.bgType === 'transparent') {
    if (settings.exportFormat === 'image/jpeg') {
      // JPEG doesn't support transparency; fallback to white
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, squareSize, squareSize);
    } else {
      ctx.clearRect(0, 0, squareSize, squareSize);
    }
  } else {
    let bgColor = '#ffffff';
    switch (settings.bgType) {
      case 'offwhite':
        bgColor = '#f8fafc';
        break;
      case 'black':
        bgColor = '#000000';
        break;
      case 'slate':
        bgColor = '#0f172a';
        break;
      case 'custom':
        bgColor = settings.customBgColor || '#ffffff';
        break;
      case 'white':
      default:
        bgColor = '#ffffff';
        break;
    }
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, squareSize, squareSize);
  }

  // 2. Draw Embedded Image (Non-cropped, centered on whiteboard)
  ctx.save();

  // Shadow if enabled
  if (settings.dropShadow) {
    const shadowScaleFactor = squareSize / 1080;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.22)';
    ctx.shadowBlur = Math.round(settings.shadowBlur * shadowScaleFactor);
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = Math.round(6 * shadowScaleFactor);
  }

  // Rounded corners on image if requested
  if (settings.cornerRadius > 0) {
    const radius = Math.min(
      settings.cornerRadius * (squareSize / 1000),
      Math.min(drawWidth, drawHeight) / 2
    );

    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(drawX, drawY, drawWidth, drawHeight, radius);
    } else {
      // Fallback for older roundRect
      ctx.moveTo(drawX + radius, drawY);
      ctx.lineTo(drawX + drawWidth - radius, drawY);
      ctx.quadraticCurveTo(drawX + drawWidth, drawY, drawX + drawWidth, drawY + radius);
      ctx.lineTo(drawX + drawWidth, drawY + drawHeight - radius);
      ctx.quadraticCurveTo(
        drawX + drawWidth,
        drawY + drawHeight,
        drawX + drawWidth - radius,
        drawY + drawHeight
      );
      ctx.lineTo(drawX + radius, drawY + drawHeight);
      ctx.quadraticCurveTo(drawX, drawY + drawHeight, drawX, drawY + drawHeight - radius);
      ctx.lineTo(drawX, drawY + radius);
      ctx.quadraticCurveTo(drawX, drawY, drawX + radius, drawY);
      ctx.closePath();
    }
    ctx.clip();
  }

  ctx.drawImage(imageSource, drawX, drawY, drawWidth, drawHeight);
  ctx.restore();

  // Export to Blob
  return new Promise<{ blob: Blob; width: number; height: number }>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas export to blob failed.'));
          return;
        }
        resolve({
          blob,
          width: squareSize,
          height: squareSize,
        });
      },
      settings.exportFormat,
      settings.exportFormat === 'image/png' ? undefined : settings.quality
    );
  });
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
