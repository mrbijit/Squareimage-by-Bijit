import JSZip from 'jszip';
import { ProcessedImage, ExportFormat } from '../types';

export function getFileExtension(format: ExportFormat): string {
  switch (format) {
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/jpeg':
    default:
      return 'jpg';
  }
}

export function cleanBaseName(fileName: string): string {
  return fileName.replace(/\.[^/.]+$/, '');
}

export async function createZipOfImages(
  images: ProcessedImage[],
  format: ExportFormat,
  suffix = '_square_1x1',
  onProgress?: (percent: number) => void
): Promise<Blob> {
  const zip = new JSZip();
  const ext = getFileExtension(format);
  const total = images.length;

  for (let i = 0; i < images.length; i++) {
    const item = images[i];
    if (item.convertedBlob) {
      const baseName = cleanBaseName(item.name);
      const outputFilename = `${baseName}${suffix}.${ext}`;
      zip.file(outputFilename, item.convertedBlob);
    }
    if (onProgress) {
      onProgress(Math.round(((i + 1) / total) * 50));
    }
  }

  const content = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    },
    (metadata) => {
      if (onProgress) {
        onProgress(50 + Math.round(metadata.percent * 0.5));
      }
    }
  );

  return content;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}
