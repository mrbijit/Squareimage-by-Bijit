import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, Sparkles, FolderUp, CheckCircle2 } from 'lucide-react';

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  onLoadSamples: () => void;
  isLoadingSamples?: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onFilesSelected,
  onLoadSamples,
  isLoadingSamples,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const validFiles = (Array.from(e.dataTransfer.files) as File[]).filter((file: File) =>
        file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|bmp|gif|svg)$/i.test(file.name)
      );
      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const validFiles = (Array.from(e.target.files) as File[]).filter((file: File) =>
        file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|bmp|gif|svg)$/i.test(file.name)
      );
      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
    }
    // reset input so the same files can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        id="dropzone-area"
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-10 transition-all cursor-pointer text-center group ${
          isDragOver
            ? 'border-sky-400 bg-sky-950/20 scale-[0.99] ring-4 ring-sky-500/10'
            : 'border-slate-700 bg-slate-900/60 hover:border-slate-500 hover:bg-slate-900/90'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.jpg,.jpeg,.png,.webp,.bmp,.gif,.svg"
          onChange={handleFileInputChange}
          className="hidden"
          id="file-input-hidden"
        />

        <div className="max-w-md mx-auto flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500/20 via-indigo-500/15 to-transparent border border-sky-500/30 flex items-center justify-center mb-4 group-hover:scale-105 transition shadow-lg shadow-sky-500/5">
            <UploadCloud className="w-8 h-8 text-sky-400 group-hover:text-sky-300 transition" />
          </div>

          <h2 className="text-base sm:text-lg font-semibold text-slate-100 mb-1.5">
            Drop Single or Multiple Images Here
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 mb-5">
            or <span className="text-sky-400 underline underline-offset-4 font-medium">browse from your computer</span>. Supports batch processing of JPG, PNG, WEBP, BMP.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-left w-full pt-4 border-t border-slate-800 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Zero Cropping</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>1:1 Whiteboard Ratio</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Instant Local Canvas</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-400 px-1">
        <div className="flex items-center gap-2">
          <span>Need test files?</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onLoadSamples();
            }}
            disabled={isLoadingSamples}
            id="btn-quick-sample-photos"
            className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 font-medium hover:underline transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isLoadingSamples ? 'Generating samples...' : 'Try with 3 sample photos'}</span>
          </button>
        </div>

        <span className="text-[11px] text-slate-500 hidden sm:inline">
          100% Client-Side Private • No image upload to external servers
        </span>
      </div>
    </div>
  );
};
