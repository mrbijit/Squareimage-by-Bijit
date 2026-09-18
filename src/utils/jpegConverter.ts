import heic2any from 'heic2any';

export function isHeicFile(file: File | { name: string; type?: string }): boolean {
  const name = file.name.toLowerCase();
  const type = (file.type || '').toLowerCase();
  return (
    name.endsWith('.heic') ||
    name.endsWith('.heif') ||
    type === 'image/heic' ||
    type === 'image/heif'
  );
}

export function detectImageFormat(file: File): string {
  const name = file.name.toLowerCase();
  if (name.endsWith('.heic') || name.endsWith('.heif')) return 'HEIC';
  if (name.endsWith('.png')) return 'PNG';
  if (name.endsWith('.webp')) return 'WEBP';
  if (name.endsWith('.bmp')) return 'BMP';
  if (name.endsWith('.avif')) return 'AVIF';
  if (name.endsWith('.gif')) return 'GIF';
  if (name.endsWith('.tiff') || name.endsWith('.tif')) return 'TIFF';
  if (name.endsWith('.jpg') || name.endsWith('.jpeg')) return 'JPEG';
  if (name.endsWith('.svg')) return 'SVG';
  return file.type.replace('image/', '').toUpperCase() || 'IMAGE';
}

/**
 * Converts HEIC or any image format into a high-quality JPEG Blob.
 * If the image has transparency (PNG, WEBP, GIF), transparent pixels are rendered over white background.
 */
export async function convertAnyImageToJpeg(
  file: File,
  quality: number = 0.95
): Promise<{
  blob: Blob;
  width: number;
  height: number;
  originalFormat: string;
}> {
  const originalFormat = detectImageFormat(file);

  // Case 1: HEIC / HEIF format
  if (isHeicFile(file)) {
    try {
      const conversionResult = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: quality,
      });

      const jpegBlob = Array.isArray(conversionResult)
        ? conversionResult[0]
        : conversionResult;

      // Extract dimensions from converted JPEG
      const dimensions = await getImageDimensionsFromBlob(jpegBlob);

      return {
        blob: jpegBlob,
        width: dimensions.width,
        height: dimensions.height,
        originalFormat,
      };
    } catch (heicErr) {
      console.warn('heic2any conversion attempt failed, trying canvas fallback:', heicErr);
      // Fallback to canvas in case browser natively supports HEIC
    }
  }

  // Case 2: Standard image formats (PNG, WEBP, BMP, AVIF, GIF, etc.)
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      try {
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          URL.revokeObjectURL(objectUrl);
          reject(new Error('Canvas 2D context unavailable'));
          return;
        }

        // Standard JPEG practice: fill transparent background with pure white
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(objectUrl);
            if (blob) {
              resolve({
                blob,
                width,
                height,
                originalFormat,
              });
            } else {
              reject(new Error('Failed to generate JPEG blob'));
            }
          },
          'image/jpeg',
          quality
        );
      } catch (err) {
        URL.revokeObjectURL(objectUrl);
        reject(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(
        new Error(
          `Could not decode ${file.name}. Please ensure it is a valid image file.`
        )
      );
    };

    img.src = objectUrl;
  });
}

function getImageDimensionsFromBlob(blob: Blob): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      URL.revokeObjectURL(url);
      resolve({ width, height });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ width: 0, height: 0 });
    };
    img.src = url;
  });
}
