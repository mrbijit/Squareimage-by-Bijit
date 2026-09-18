import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { UploadZone } from './components/UploadZone';
import { ControlsPanel } from './components/ControlsPanel';
import { ImageGrid } from './components/ImageGrid';
import { PreviewModal } from './components/PreviewModal';
import { WindowsExeModal } from './components/WindowsExeModal';
import { HelpModal } from './components/HelpModal';
import { StatusBar } from './components/StatusBar';
import { HeicJpegConverter } from './components/HeicJpegConverter';
import { ProcessedImage, ConversionSettings, AppMode } from './types';
import { processImageTo1x1 } from './utils/imageProcessor';
import { createZipOfImages, downloadBlob, getFileExtension, cleanBaseName } from './utils/zipGenerator';
import { createSampleImagesList } from './utils/sampleImages';

const DEFAULT_SETTINGS: ConversionSettings = {
  bgType: 'white',
  customBgColor: '#ffffff',
  paddingPercent: 0,
  cornerRadius: 0,
  dropShadow: false,
  shadowBlur: 14,
  targetDimension: 'original-max',
  customSquareSize: 1080,
  exportFormat: 'image/jpeg',
  quality: 0.95,
  filenameSuffix: '_1x1_whiteboard',
};

export default function App() {
  const [activeMode, setActiveMode] = useState<AppMode>('whiteboard');
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [settings, setSettings] = useState<ConversionSettings>(DEFAULT_SETTINGS);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);
  const [selectedPreviewItem, setSelectedPreviewItem] = useState<ProcessedImage | null>(null);
  const [isWindowsModalOpen, setIsWindowsModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isLoadingSamples, setIsLoadingSamples] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to load image natural dimensions
  const loadImageData = (file: File): Promise<{ img: HTMLImageElement; width: number; height: number; previewUrl: string }> => {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        resolve({
          img,
          width: img.naturalWidth,
          height: img.naturalHeight,
          previewUrl: url,
        });
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error(`Failed to load image: ${file.name}`));
      };
      img.src = url;
    });
  };

  // Convert a single image with given settings
  const convertSingleImage = async (
    item: ProcessedImage,
    currentSettings: ConversionSettings
  ): Promise<Partial<ProcessedImage>> => {
    try {
      const { img } = await loadImageData(item.file);
      const result = await processImageTo1x1(img, currentSettings);
      const convertedUrl = URL.createObjectURL(result.blob);

      return {
        status: 'done',
        progress: 100,
        convertedBlob: result.blob,
        convertedUrl,
        convertedWidth: result.width,
        convertedHeight: result.height,
        convertedSize: result.blob.size,
      };
    } catch (err) {
      console.error('Error converting image:', err);
      return {
        status: 'error',
        error: err instanceof Error ? err.message : 'Conversion failed',
      };
    }
  };

  // Handle addition of new files
  const handleFilesSelected = async (newFiles: File[]) => {
    if (newFiles.length === 0) return;

    setIsProcessingBatch(true);

    const newItems: ProcessedImage[] = [];

    for (const file of newFiles) {
      try {
        const { width, height, previewUrl } = await loadImageData(file);
        const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
        const divisor = gcd(width, height);
        const aspect = `${Math.round(width / divisor)}:${Math.round(height / divisor)}`;

        newItems.push({
          id: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          file,
          name: file.name,
          originalWidth: width,
          originalHeight: height,
          originalSize: file.size,
          originalAspectRatio: aspect,
          previewUrl,
          status: 'pending',
          progress: 0,
          convertedBlob: null,
          convertedUrl: null,
          convertedWidth: 0,
          convertedHeight: 0,
          convertedSize: null,
        });
      } catch (err) {
        console.error('Failed to parse image file', err);
      }
    }

    // Append to existing images
    setImages((prev) => [...prev, ...newItems]);

    // Process newly added items
    for (const item of newItems) {
      setImages((prev) =>
        prev.map((img) => (img.id === item.id ? { ...img, status: 'processing' } : img))
      );

      const update = await convertSingleImage(item, settings);

      setImages((prev) =>
        prev.map((img) => (img.id === item.id ? { ...img, ...update } : img))
      );
    }

    setIsProcessingBatch(false);
  };

  // Reprocess all images when settings change
  const reprocessAll = useCallback(async (newSettings: ConversionSettings) => {
    setImages((prev) => {
      if (prev.length === 0) return prev;
      return prev.map((item) => {
        if (item.convertedUrl) URL.revokeObjectURL(item.convertedUrl);
        return { ...item, status: 'processing', convertedBlob: null, convertedUrl: null };
      });
    });

    setIsProcessingBatch(true);

    setImages((prev) => {
      // We process asynchronously
      (async () => {
        for (const item of prev) {
          const update = await convertSingleImage(item, newSettings);
          setImages((currentList) =>
            currentList.map((img) => (img.id === item.id ? { ...img, ...update } : img))
          );
        }
        setIsProcessingBatch(false);
      })();
      return prev;
    });
  }, []);

  // Update settings with reprocess trigger
  const handleSettingsChange = (newSettings: ConversionSettings) => {
    setSettings(newSettings);
    if (images.length > 0) {
      reprocessAll(newSettings);
    }
  };

  const handleResetSettings = () => {
    handleSettingsChange(DEFAULT_SETTINGS);
  };

  // Remove single image
  const handleRemoveImage = (id: string) => {
    setImages((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) {
        if (target.previewUrl) URL.revokeObjectURL(target.previewUrl);
        if (target.convertedUrl) URL.revokeObjectURL(target.convertedUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
    if (selectedPreviewItem?.id === id) {
      setSelectedPreviewItem(null);
    }
  };

  // Clear all images
  const handleClearAll = () => {
    images.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      if (item.convertedUrl) URL.revokeObjectURL(item.convertedUrl);
    });
    setImages([]);
    setSelectedPreviewItem(null);
  };

  // Download single image
  const handleDownloadSingle = (item: ProcessedImage) => {
    if (!item.convertedBlob) return;
    const ext = getFileExtension(settings.exportFormat);
    const baseName = cleanBaseName(item.name);
    const filename = `${baseName}${settings.filenameSuffix}.${ext}`;
    downloadBlob(item.convertedBlob, filename);
  };

  // Download all as ZIP
  const handleDownloadZip = async () => {
    const readyImages = images.filter((img) => img.status === 'done' && img.convertedBlob);
    if (readyImages.length === 0) return;

    try {
      setIsZipping(true);
      setZipProgress(0);

      const zipBlob = await createZipOfImages(
        readyImages,
        settings.exportFormat,
        settings.filenameSuffix,
        (progress) => setZipProgress(progress)
      );

      downloadBlob(zipBlob, `squareimage_by_bijit_batch_${Date.now()}.zip`);
    } catch (err) {
      console.error('Error generating batch zip:', err);
    } finally {
      setIsZipping(false);
      setZipProgress(0);
    }
  };

  // Load sample images
  const handleLoadSamples = async () => {
    try {
      setIsLoadingSamples(true);
      const samples = await createSampleImagesList();
      await handleFilesSelected(samples);
    } catch (err) {
      console.error('Failed to load sample photos', err);
    } finally {
      setIsLoadingSamples(false);
    }
  };

  // Keep modal item updated if images re-render
  useEffect(() => {
    if (selectedPreviewItem) {
      const fresh = images.find((img) => img.id === selectedPreviewItem.id);
      if (fresh) setSelectedPreviewItem(fresh);
    }
  }, [images]);

  const readyCount = images.filter((img) => img.status === 'done').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-slate-950">
      {/* Hidden input for "Add More" */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.jpg,.jpeg,.png,.webp,.bmp,.gif,.svg"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFilesSelected(Array.from(e.target.files));
          }
          if (fileInputRef.current) fileInputRef.current.value = '';
        }}
        className="hidden"
      />

      {/* App Header */}
      <Header
        onOpenWindowsModal={() => setIsWindowsModalOpen(true)}
        onOpenHelpModal={() => setIsHelpModalOpen(true)}
        onLoadSamples={handleLoadSamples}
        totalImages={images.length}
        activeMode={activeMode}
        onModeChange={setActiveMode}
      />

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {activeMode === 'whiteboard' ? (
          <>
            {/* Upload Zone */}
            <UploadZone
              onFilesSelected={handleFilesSelected}
              onLoadSamples={handleLoadSamples}
              isLoadingSamples={isLoadingSamples}
            />

            {/* Content Area: Controls + Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Settings Sidebar */}
              <div className="lg:col-span-4 lg:sticky lg:top-20">
                <ControlsPanel
                  settings={settings}
                  onChange={handleSettingsChange}
                  onReset={handleResetSettings}
                  disabled={isProcessingBatch}
                />
              </div>

              {/* Batch Images Preview & Action Area */}
              <div className="lg:col-span-8 space-y-4">
                {images.length > 0 ? (
                  <ImageGrid
                    images={images}
                    onRemove={handleRemoveImage}
                    onClearAll={handleClearAll}
                    onDownloadSingle={handleDownloadSingle}
                    onDownloadZip={handleDownloadZip}
                    onInspect={(item) => setSelectedPreviewItem(item)}
                    onAddMoreClick={() => fileInputRef.current?.click()}
                    isZipping={isZipping}
                    zipProgress={zipProgress}
                    exportFormat={settings.exportFormat}
                  />
                ) : (
                  <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-10 text-center flex flex-col items-center justify-center space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-500">
                      <div className="w-6 h-6 border-2 border-dashed border-slate-500 rounded-sm" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-300">
                      No images in conversion queue
                    </h3>
                    <p className="text-xs text-slate-400 max-w-md">
                      Drop single or multiple images above to instantly convert them into 1:1 ratio placed on a 1:1 whiteboard without cropping.
                    </p>
                    <button
                      type="button"
                      onClick={handleLoadSamples}
                      disabled={isLoadingSamples}
                      className="mt-2 text-xs font-semibold text-sky-400 hover:text-sky-300 bg-sky-950/50 border border-sky-500/30 px-3 py-1.5 rounded-lg transition"
                    >
                      {isLoadingSamples ? 'Generating samples...' : 'Click here to load 3 sample images'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          /* New Feature: HEIC & All Formats to JPEG Converter */
          <HeicJpegConverter />
        )}
      </main>

      {/* Windows Desktop Status Bar */}
      <StatusBar
        totalCount={images.length}
        readyCount={readyCount}
        isProcessing={isProcessingBatch}
        settings={settings}
        activeMode={activeMode}
      />

      {/* Inspect / High-Res Preview Modal */}
      <PreviewModal
        item={selectedPreviewItem}
        onClose={() => setSelectedPreviewItem(null)}
        onDownload={handleDownloadSingle}
        exportFormat={settings.exportFormat}
      />

      {/* Windows Software & .EXE Package Modal */}
      <WindowsExeModal
        isOpen={isWindowsModalOpen}
        onClose={() => setIsWindowsModalOpen(false)}
      />

      {/* Help & Info Modal */}
      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </div>
  );
}
