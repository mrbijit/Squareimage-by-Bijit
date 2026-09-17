import React, { useState } from 'react';
import { X, Download, ZoomIn, ZoomOut, Check, ArrowLeftRight, Maximize } from 'lucide-react';
import { ProcessedImage, ExportFormat } from '../types';
import { formatBytes } from '../utils/imageProcessor';
import { getFileExtension } from '../utils/zipGenerator';

interface PreviewModalProps {
  item: ProcessedImage | null;
  onClose: () => void;
  onDownload: (item: ProcessedImage) => void;
  exportFormat: ExportFormat;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  item,
  onClose,
  onDownload,
  exportFormat,
}) => {
  const [activeTab, setActiveTab] = useState<'result' | 'original' | 'split'>('result');
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  if (!item) return null;

  const ext = getFileExtension(exportFormat);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-white truncate">{item.name}</h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Original: {item.originalWidth} × {item.originalHeight} ({item.originalAspectRatio}) &rarr; Whiteboard 1:1: {item.convertedWidth} × {item.convertedHeight} px
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View switcher */}
            <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('result')}
                className={`px-3 py-1 rounded-md transition font-medium ${
                  activeTab === 'result' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                1:1 Whiteboard
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('original')}
                className={`px-3 py-1 rounded-md transition font-medium ${
                  activeTab === 'original' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Original
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('split')}
                className={`px-3 py-1 rounded-md transition font-medium ${
                  activeTab === 'split' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Side-by-Side
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Canvas Viewport */}
        <div className="flex-1 bg-slate-950 p-6 flex items-center justify-center overflow-auto min-h-[380px] relative">
          {activeTab === 'result' && item.convertedUrl && (
            <div className="relative max-w-full max-h-[60vh] flex items-center justify-center">
              {/* Checkered pattern underneath to show canvas boundaries */}
              <div className="p-2 border-2 border-dashed border-sky-500/40 rounded-xl bg-slate-900/50 shadow-2xl relative">
                <img
                  src={item.convertedUrl}
                  alt="Converted 1:1"
                  className="max-h-[55vh] max-w-full object-contain rounded-lg shadow-lg"
                  style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.15s ease' }}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute -top-3 left-4 bg-sky-500 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded shadow">
                  1:1 RATIO WHITEBOARD
                </div>
              </div>
            </div>
          )}

          {activeTab === 'original' && (
            <div className="relative max-w-full max-h-[60vh] flex items-center justify-center">
              <div className="p-2 border-2 border-dashed border-slate-700 rounded-xl bg-slate-900/50">
                <img
                  src={item.previewUrl}
                  alt="Original"
                  className="max-h-[55vh] max-w-full object-contain rounded-lg shadow-lg"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute -top-3 left-4 bg-slate-700 text-slate-200 text-[10px] font-bold px-2 py-0.5 rounded">
                  ORIGINAL ({item.originalWidth}x{item.originalHeight})
                </div>
              </div>
            </div>
          )}

          {activeTab === 'split' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl items-center">
              <div className="flex flex-col items-center">
                <div className="text-xs font-semibold text-slate-400 mb-2">Original Aspect Ratio</div>
                <div className="w-full h-64 bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-center relative">
                  <img
                    src={item.previewUrl}
                    alt="Original"
                    className="max-h-full max-w-full object-contain rounded"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-2 left-2 bg-slate-950/80 px-2 py-0.5 text-[10px] rounded text-slate-300 font-mono">
                    {item.originalWidth} × {item.originalHeight}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="text-xs font-semibold text-sky-400 mb-2">1:1 Whiteboard (No Crop)</div>
                <div className="w-full h-64 bg-slate-900 border border-sky-500/30 rounded-xl p-3 flex items-center justify-center relative">
                  {item.convertedUrl && (
                    <img
                      src={item.convertedUrl}
                      alt="1:1 Whiteboard"
                      className="max-h-full max-w-full aspect-square object-contain rounded shadow"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <div className="absolute bottom-2 left-2 bg-sky-950/90 text-sky-300 px-2 py-0.5 text-[10px] rounded font-mono font-semibold border border-sky-500/30">
                    {item.convertedWidth} × {item.convertedHeight} (1:1)
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Zoom controls in result mode */}
          {activeTab === 'result' && (
            <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-slate-900/90 backdrop-blur border border-slate-700 p-1 rounded-xl text-slate-300">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.2))}
                className="p-1 hover:bg-slate-800 rounded"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-mono px-1">{Math.round(zoomLevel * 100)}%</span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(2.0, z + 0.2))}
                className="p-1 hover:bg-slate-800 rounded"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(1)}
                className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white"
              >
                100%
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Export size: <span className="font-mono text-slate-200">{formatBytes(item.convertedSize || 0)}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium rounded-xl text-slate-300 hover:bg-slate-800 border border-slate-700 transition"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => onDownload(item)}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-xl bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/20 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download 1:1 Image (.{ext})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
