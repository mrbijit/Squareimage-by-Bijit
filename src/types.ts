export interface ProcessedImage {
  id: string;
  file: File;
  name: string;
  originalWidth: number;
  originalHeight: number;
  originalSize: number;
  originalAspectRatio: string;
  previewUrl: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  progress: number;
  convertedBlob: Blob | null;
  convertedUrl: string | null;
  convertedWidth: number;
  convertedHeight: number;
  convertedSize: number | null;
  error?: string;
}

export type WhiteboardBgType = 'white' | 'offwhite' | 'black' | 'slate' | 'blur' | 'transparent' | 'custom';

export type TargetDimensionType = 'original-max' | '1080' | '1200' | '2048' | 'custom';

export type ExportFormat = 'image/jpeg' | 'image/png' | 'image/webp';

export interface ConversionSettings {
  bgType: WhiteboardBgType;
  customBgColor: string;
  paddingPercent: number; // 0 to 40% margin
  cornerRadius: number; // 0 to 60px on embedded image
  dropShadow: boolean;
  shadowBlur: number;
  targetDimension: TargetDimensionType;
  customSquareSize: number;
  exportFormat: ExportFormat;
  quality: number; // 0.1 to 1.0 (for jpeg/webp)
  filenameSuffix: string;
}

export type AppMode = 'whiteboard' | 'heic-to-jpeg';

export interface HeicJpegItem {
  id: string;
  file: File;
  name: string;
  originalFormat: string;
  originalSize: number;
  previewUrl: string;
  width: number;
  height: number;
  status: 'pending' | 'converting' | 'done' | 'error';
  progress: number;
  convertedBlob: Blob | null;
  convertedUrl: string | null;
  convertedSize: number | null;
  error?: string;
}

export interface HeicJpegSettings {
  quality: number; // 0.7 to 1.0
  namingOption: 'replace-ext' | 'suffix';
  filenameSuffix: string;
}
