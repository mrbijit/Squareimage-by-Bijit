import React from 'react';
import {
  Download,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  FileArchive,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { ProcessedImage, ExportFormat } from '../types';
import { formatBytes } from '../utils/imageProcessor';
import { getFileExtension } from '../utils/zipGenerator';

interface ImageGridProps {
  images: ProcessedImage[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
  onDownloadSingle: (item: ProcessedImage) => void;
  onDownloadZip: () => void;
  onInspect: (item: ProcessedImage) => void;
  onAddMoreClick: () => void;
  isZipping: boolean;
  zipProgress: number;
  exportFormat: ExportFormat;
}

export const ImageGrid: React.FC<ImageGridProps> = ({
  images,
  onRemove,
  onClearAll,
  onDownloadSingle,
  onDownloadZip,
  onInspect,
  onAddMoreClick,
  isZipping,
  zipProgress,
  exportFormat,
}) => {
  const readyCount = images.filter((img) => img.status === 'done').length;
  const ext = getFileExtension(exportFormat);

  return (
    <div className="space-y-4">
      {/* Batch Actions Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 font-bold text-sm">
            {images.length}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100">
              Batch Queue ({readyCount} of {images.length} ready)
            </h3>
            <p className="text-xs text-slate-400">
              Placed onto 1:1 Whiteboard • No cropping applied
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onAddMoreClick}
            id="btn-add-more-images"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add More</span>
          </button>

          <button
            type="button"
            onClick={onClearAll}
            id="btn-clear-all-images"
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All</span>
          </button>

          <button
            type="button"
            onClick={onDownloadZip}
            disabled={readyCount === 0 || isZipping}
            id="btn-download-all-zip"
            className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:pointer-events-none text-white shadow-md shadow-emerald-600/20 transition"
          >
            <FileArchive className="w-4 h-4" />
            <span>
              {isZipping
                ? `Packing ZIP (${zipProgress}%)`
                : `Download All as ZIP (${readyCount})`}
            </span>
          </button>
        </div>
      </div>

      {/* Images List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {images.map((item, index) => {
          const isLandscape = item.originalWidth > item.originalHeight;
          const isPortrait = item.originalHeight > item.originalWidth;
          const isSquare = item.originalWidth === item.originalHeight;

          return (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition shadow-sm flex flex-col justify-between space-y-3 group"
            >
              {/* Header Info */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono text-slate-500">#{index + 1}</span>
                    <h4
                      className="text-xs font-semibold text-slate-200 truncate"
                      title={item.name}
                    >
                      {item.name}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5 font-mono">
                    <span>
                      {item.originalWidth} × {item.originalHeight}
                    </span>
                    <span>•</span>
                    <span className="text-sky-400">
                      {isSquare ? '1:1 Square' : isLandscape ? 'Landscape' : 'Portrait'}
                    </span>
                    <span>•</span>
                    <span>{formatBytes(item.originalSize)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onInspect(item)}
                    title="Inspect side-by-side"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove(item.id)}
                    title="Remove from queue"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Side-by-Side Visual Transformation */}
              <div className="grid grid-cols-2 gap-3 items-center bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                {/* Original Thumbnail */}
                <div className="flex flex-col items-center">
                  <div className="text-[10px] uppercase font-bold text-slate-500 mb-1 tracking-wider">
                    Original
                  </div>
                  <div className="w-full h-32 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center p-1.5 overflow-hidden relative">
                    <img
                      src={item.previewUrl}
                      alt="Original input"
                      className="max-h-full max-w-full object-contain rounded-xs"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-1 right-1 bg-slate-950/90 text-[9px] font-mono text-slate-300 px-1 py-0.5 rounded border border-slate-800">
                      {item.originalAspectRatio}
                    </div>
                  </div>
                </div>

                {/* Converted 1:1 Whiteboard Thumbnail */}
                <div className="flex flex-col items-center">
                  <div className="text-[10px] uppercase font-bold text-emerald-400 mb-1 tracking-wider flex items-center gap-1">
                    <span>1:1 Whiteboard</span>
                  </div>
                  <div className="w-full h-32 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center p-1.5 overflow-hidden relative">
                    {item.status === 'processing' ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                        <span className="text-[10px] text-slate-400">Rendering...</span>
                      </div>
                    ) : item.convertedUrl ? (
                      <>
                        <img
                          src={item.convertedUrl}
                          alt="1:1 Whiteboard Result"
                          className="max-h-full max-w-full aspect-square object-contain rounded-xs shadow-md"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute bottom-1 right-1 bg-emerald-950/90 text-emerald-300 text-[9px] font-mono font-bold px-1 py-0.5 rounded border border-emerald-500/30">
                          {item.convertedWidth}×{item.convertedHeight} (1:1)
                        </div>
                      </>
                    ) : (
                      <div className="text-[10px] text-rose-400 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Failed</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer with Status & Download */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5 text-xs">
                  {item.status === 'done' ? (
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-medium text-[11px]">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Ready ({formatBytes(item.convertedSize || 0)})</span>
                    </span>
                  ) : item.status === 'processing' ? (
                    <span className="inline-flex items-center gap-1 text-sky-400 text-[11px]">
                      <Clock className="w-3.5 h-3.5 animate-pulse" />
                      <span>Processing...</span>
                    </span>
                  ) : (
                    <span className="text-slate-500 text-[11px]">Pending</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onDownloadSingle(item)}
                  disabled={item.status !== 'done' || !item.convertedBlob}
                  id={`btn-download-${item.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:pointer-events-none text-white shadow-xs transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .{ext}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
