import React, { useState, useRef } from 'react';
import {
  Upload,
  FileImage,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sliders,
  Archive,
  ArrowRight,
  Eye,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { HeicJpegItem, HeicJpegSettings } from '../types';
import { convertAnyImageToJpeg, detectImageFormat, isHeicFile } from '../utils/jpegConverter';
import { downloadBlob, cleanBaseName } from '../utils/zipGenerator';
import JSZip from 'jszip';

interface HeicJpegConverterProps {
  onNotify?: (msg: string) => void;
}

export const HeicJpegConverter: React.FC<HeicJpegConverterProps> = () => {
  const [items, setItems] = useState<HeicJpegItem[]>([]);
  const [settings, setSettings] = useState<HeicJpegSettings>({
    quality: 0.95,
    namingOption: 'replace-ext',
    filenameSuffix: '_converted',
  });
  const [isDragOver, setIsDragOver] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);
  const [previewModalItem, setPreviewModalItem] = useState<HeicJpegItem | null>(null);
  const [isConvertingBatch, setIsConvertingBatch] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatBytes = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getOutputFilename = (originalName: string): string => {
    const base = cleanBaseName(originalName);
    if (settings.namingOption === 'replace-ext') {
      return `${base}.jpg`;
    }
    return `${base}${settings.filenameSuffix}.jpg`;
  };

  // Convert an individual item
  const processItem = async (
    item: HeicJpegItem,
    quality: number
  ): Promise<Partial<HeicJpegItem>> => {
    try {
      const result = await convertAnyImageToJpeg(item.file, quality);
      const convertedUrl = URL.createObjectURL(result.blob);

      return {
        status: 'done',
        progress: 100,
        convertedBlob: result.blob,
        convertedUrl,
        width: result.width,
        height: result.height,
        convertedSize: result.blob.size,
      };
    } catch (err) {
      console.error(`Error converting ${item.name}:`, err);
      return {
        status: 'error',
        error: err instanceof Error ? err.message : 'Conversion failed',
      };
    }
  };

  // Handle incoming files
  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;

    setIsConvertingBatch(true);

    const newItems: HeicJpegItem[] = files.map((file) => {
      const isHeic = isHeicFile(file);
      // For standard images, we can generate instant preview; for HEIC we'll display placeholder until converted
      const previewUrl = isHeic ? '' : URL.createObjectURL(file);

      return {
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        file,
        name: file.name,
        originalFormat: detectImageFormat(file),
        originalSize: file.size,
        previewUrl,
        width: 0,
        height: 0,
        status: 'converting',
        progress: 0,
        convertedBlob: null,
        convertedUrl: null,
        convertedSize: null,
      };
    });

    setItems((prev) => [...prev, ...newItems]);

    // Process each file
    for (const item of newItems) {
      const update = await processItem(item, settings.quality);
      setItems((currentList) =>
        currentList.map((i) => (i.id === item.id ? { ...i, ...update } : i))
      );
    }

    setIsConvertingBatch(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  // Reconvert all items when quality changes
  const handleQualityChange = async (newQuality: number) => {
    setSettings((prev) => ({ ...prev, quality: newQuality }));
    if (items.length === 0) return;

    setIsConvertingBatch(true);
    setItems((prev) =>
      prev.map((item) => ({ ...item, status: 'converting' }))
    );

    for (const item of items) {
      const update = await processItem(item, newQuality);
      setItems((current) =>
        current.map((i) => (i.id === item.id ? { ...i, ...update } : i))
      );
    }
    setIsConvertingBatch(false);
  };

  // Option 1: Save One by One
  const handleSaveSingle = (item: HeicJpegItem) => {
    if (!item.convertedBlob) return;
    const filename = getOutputFilename(item.name);
    downloadBlob(item.convertedBlob, filename);
  };

  // Option 2: Save All at Once as ZIP
  const handleSaveAllAsZip = async () => {
    const readyItems = items.filter((i) => i.status === 'done' && i.convertedBlob);
    if (readyItems.length === 0) return;

    try {
      setIsZipping(true);
      setZipProgress(0);

      const zip = new JSZip();

      readyItems.forEach((item, index) => {
        const filename = getOutputFilename(item.name);
        // Avoid duplicate filenames in zip
        const uniqueName = readyItems.filter((x, idx) => idx < index && getOutputFilename(x.name) === filename).length > 0
          ? `${cleanBaseName(item.name)}_${index + 1}.jpg`
          : filename;

        zip.file(uniqueName, item.convertedBlob as Blob);
      });

      const zipContent = await zip.generateAsync(
        { type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } },
        (metadata) => setZipProgress(Math.round(metadata.percent))
      );

      downloadBlob(zipContent, `converted_jpegs_by_bijit_${Date.now()}.zip`);
    } catch (err) {
      console.error('Error generating zip:', err);
    } finally {
      setIsZipping(false);
      setZipProgress(0);
    }
  };

  // Option 3: Save All One-by-One sequentially
  const handleSaveAllSequentially = () => {
    const readyItems = items.filter((i) => i.status === 'done' && i.convertedBlob);
    if (readyItems.length === 0) return;

    readyItems.forEach((item, index) => {
      setTimeout(() => {
        handleSaveSingle(item);
      }, index * 200);
    });
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target) {
        if (target.previewUrl) URL.revokeObjectURL(target.previewUrl);
        if (target.convertedUrl) URL.revokeObjectURL(target.convertedUrl);
      }
      return prev.filter((i) => i.id !== id);
    });
    if (previewModalItem?.id === id) {
      setPreviewModalItem(null);
    }
  };

  const handleClearAll = () => {
    items.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      if (item.convertedUrl) URL.revokeObjectURL(item.convertedUrl);
    });
    setItems([]);
    setPreviewModalItem(null);
  };

  // Load sample images for testing
  const handleLoadSamples = async () => {
    const createSampleFile = (
      name: string,
      type: string,
      color1: string,
      color2: string,
      label: string
    ): Promise<File> => {
      return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = 1600;
        canvas.height = 1200;
        const ctx = canvas.getContext('2d')!;

        const grad = ctx.createLinearGradient(0, 0, 1600, 1200);
        grad.addColorStop(0, color1);
        grad.addColorStop(1, color2);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1600, 1200);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 64px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(label, 800, 560);
        ctx.font = '36px -apple-system, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.fillText('1600 × 1200 • Ready for JPEG conversion', 800, 640);

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(new File([blob], name, { type }));
          }
        }, type);
      });
    };

    const samples = await Promise.all([
      createSampleFile('iPhone_photo_sample.heic', 'image/heic', '#ec4899', '#8b5cf6', 'Apple HEIC Format'),
      createSampleFile('graphic_transparent.png', 'image/png', '#0284c7', '#0d9488', 'PNG Lossless Image'),
      createSampleFile('modern_web_photo.webp', 'image/webp', '#f59e0b', '#ef4444', 'Google WEBP Format'),
    ]);

    await handleFiles(samples);
  };

  const readyCount = items.filter((i) => i.status === 'done').length;
  const totalOriginalSize = items.reduce((acc, i) => acc + i.originalSize, 0);
  const totalConvertedSize = items.reduce((acc, i) => acc + (i.convertedSize || 0), 0);
  const sizeDiff = totalOriginalSize - totalConvertedSize;

  return (
    <div className="space-y-6">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".heic,.heif,.png,.webp,.bmp,.gif,.tiff,.tif,.avif,.jpg,.jpeg,.svg,image/*"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFiles(Array.from(e.target.files));
          }
          if (fileInputRef.current) fileInputRef.current.value = '';
        }}
        className="hidden"
      />

      {/* Hero Header & Upload Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <RefreshCw className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold text-slate-100">
                HEIC &amp; All Formats &rarr; JPEG Converter
              </h2>
              <span className="px-2 py-0.5 text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-full">
                NEW FEATURE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1.5">
              Convert Apple iPhone HEIC, PNG, WEBP, BMP, AVIF, TIFF and other formats directly to universal high-quality JPEG.
              Preserves full original resolution and aspect ratio.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLoadSamples}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Load Sample Images
            </button>
          </div>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-200 ${
            isDragOver
              ? 'border-amber-400 bg-amber-950/20 scale-[1.005]'
              : 'border-slate-700 hover:border-slate-600 bg-slate-950/40 hover:bg-slate-950/60'
          }`}
        >
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Upload className="w-7 h-7" />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-100">
                Drop your <span className="text-amber-400">HEIC</span> or any image files here
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Supports single or multiple files: HEIC, HEIF, PNG, WEBP, BMP, AVIF, TIFF, GIF
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[11px] text-slate-400">
              <span className="bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700 font-mono text-amber-300">.HEIC</span>
              <span className="bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700 font-mono text-sky-300">.PNG</span>
              <span className="bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700 font-mono text-emerald-300">.WEBP</span>
              <span className="bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700 font-mono text-purple-300">.BMP</span>
              <span className="bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700 font-mono text-indigo-300">.AVIF</span>
              <span className="bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700 font-mono text-rose-300">.TIFF</span>
              <span className="text-slate-500">&rarr;</span>
              <span className="bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/40 font-mono font-bold text-amber-300">.JPG</span>
            </div>
          </div>
        </div>

        {/* Converter Configuration Bar */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-slate-400" />
              <label className="text-xs font-semibold text-slate-300">
                JPEG Quality:
              </label>
              <span className="text-xs font-mono font-bold text-amber-400">
                {Math.round(settings.quality * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="70"
              max="100"
              step="1"
              value={Math.round(settings.quality * 100)}
              onChange={(e) => handleQualityChange(parseInt(e.target.value, 10) / 100)}
              className="w-32 accent-amber-500 cursor-pointer"
            />
            <span className="text-[11px] text-slate-500">
              {settings.quality >= 0.95 ? '(Maximum Clarity)' : '(Balanced Size)'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-300">Output Naming:</label>
            <select
              value={settings.namingOption}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  namingOption: e.target.value as 'replace-ext' | 'suffix',
                }))
              }
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
            >
              <option value="replace-ext">Clean (e.g. photo.jpg)</option>
              <option value="suffix">With Suffix (e.g. photo_converted.jpg)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Batch Actions & Queue List */}
      {items.length > 0 && (
        <div className="space-y-4">
          {/* Main Action Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-100">
                  {readyCount} of {items.length} Images Ready
                </span>
                {isConvertingBatch && (
                  <span className="inline-flex items-center gap-1 text-xs text-amber-400 font-medium">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Converting...
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Total size: {formatBytes(totalOriginalSize)} &rarr; Converted: {formatBytes(totalConvertedSize)}{' '}
                {sizeDiff > 0 && (
                  <span className="text-emerald-400 font-semibold">
                    (Saved {formatBytes(sizeDiff)})
                  </span>
                )}
              </p>
            </div>

            {/* User Requested Options: Save all at once OR save one by one */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={handleClearAll}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
              >
                Clear All
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                + Add More Files
              </button>

              {/* Option 1: Save All Individually */}
              <button
                type="button"
                onClick={handleSaveAllSequentially}
                disabled={readyCount === 0}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                title="Trigger sequential browser downloads for all converted JPEGs"
              >
                <Download className="w-3.5 h-3.5 text-slate-300" />
                Save All (One-by-One)
              </button>

              {/* Option 2: Save All at Once as a Single ZIP */}
              <button
                type="button"
                onClick={handleSaveAllAsZip}
                disabled={readyCount === 0 || isZipping}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/50 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isZipping ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Packaging ZIP ({zipProgress}%)...
                  </>
                ) : (
                  <>
                    <Archive className="w-4 h-4" />
                    Save All at Once (.ZIP)
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => {
              const outFilename = getOutputFilename(item.name);
              const isConverting = item.status === 'converting';
              const isError = item.status === 'error';
              const isDone = item.status === 'done';

              return (
                <div
                  key={item.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between hover:border-slate-700 transition group"
                >
                  {/* Thumbnail / Preview Area */}
                  <div className="relative aspect-video bg-slate-950 flex items-center justify-center overflow-hidden border-b border-slate-800/80">
                    {item.convertedUrl || item.previewUrl ? (
                      <img
                        src={item.convertedUrl || item.previewUrl}
                        alt={item.name}
                        className="w-full h-full object-contain p-2"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-4 text-center">
                        {isConverting ? (
                          <>
                            <Loader2 className="w-8 h-8 text-amber-400 animate-spin mb-2" />
                            <span className="text-xs text-slate-400">Decoding {item.originalFormat}...</span>
                          </>
                        ) : (
                          <FileImage className="w-8 h-8 text-slate-600 mb-1" />
                        )}
                      </div>
                    )}

                    {/* Format Badge overlay */}
                    <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-sm px-2 py-1 rounded-md border border-slate-700/60 text-[10px] font-mono font-semibold">
                      <span className="text-amber-400">{item.originalFormat}</span>
                      <ArrowRight className="w-3 h-3 text-slate-500" />
                      <span className="text-emerald-400 font-bold">JPEG</span>
                    </div>

                    {/* Preview Full Size Button */}
                    {item.convertedUrl && (
                      <button
                        type="button"
                        onClick={() => setPreviewModalItem(item)}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 transition opacity-0 group-hover:opacity-100"
                        title="Preview Full Size"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Details Area */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4
                          className="text-xs font-bold text-slate-200 truncate"
                          title={outFilename}
                        >
                          {outFilename}
                        </h4>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-slate-500 hover:text-rose-400 p-0.5 rounded transition"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-400 truncate">
                        Original: {item.name}
                      </p>

                      {/* File size & dimension info */}
                      <div className="flex items-center justify-between text-[11px] pt-1 text-slate-400">
                        <span>
                          {item.width && item.height
                            ? `${item.width} × ${item.height} px`
                            : 'Reading size...'}
                        </span>
                        <span>
                          {formatBytes(item.originalSize)}{' '}
                          {item.convertedSize ? (
                            <span className="text-emerald-400 font-semibold">
                              &rarr; {formatBytes(item.convertedSize)}
                            </span>
                          ) : null}
                        </span>
                      </div>
                    </div>

                    {/* Status & Save Button */}
                    <div className="pt-2 border-t border-slate-800/80">
                      {isError ? (
                        <div className="flex items-center justify-between text-xs text-rose-400">
                          <span className="flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Failed to convert
                          </span>
                          <button
                            type="button"
                            onClick={async () => {
                              setItems((l) =>
                                l.map((x) => (x.id === item.id ? { ...x, status: 'converting' } : x))
                              );
                              const update = await processItem(item, settings.quality);
                              setItems((l) =>
                                l.map((x) => (x.id === item.id ? { ...x, ...update } : x))
                              );
                            }}
                            className="text-amber-400 hover:underline text-[11px]"
                          >
                            Retry
                          </button>
                        </div>
                      ) : isConverting ? (
                        <div className="flex items-center justify-center gap-2 py-2 text-xs text-amber-400">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Converting to JPEG...</span>
                        </div>
                      ) : (
                        /* Save One by One button on each card */
                        <button
                          type="button"
                          onClick={() => handleSaveSingle(item)}
                          className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Save JPEG (One-by-One)
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Preview Modal for Converted JPEG */}
      {previewModalItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-100">
                  {getOutputFilename(previewModalItem.name)}
                </h3>
                <p className="text-xs text-slate-400">
                  {previewModalItem.width} × {previewModalItem.height} px •{' '}
                  {formatBytes(previewModalItem.convertedSize || 0)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewModalItem(null)}
                className="text-slate-400 hover:text-white text-lg px-2"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[60vh] flex items-center justify-center bg-slate-950 rounded-xl overflow-hidden p-2">
              <img
                src={previewModalItem.convertedUrl || ''}
                alt="Converted JPEG"
                className="max-h-[55vh] object-contain rounded"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPreviewModalItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  handleSaveSingle(previewModalItem);
                  setPreviewModalItem(null);
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Download This JPEG
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
