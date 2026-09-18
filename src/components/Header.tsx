import React from 'react';
import { Download, Monitor, Package, Sparkles, HelpCircle, RefreshCw, Square, ArrowRightLeft } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { AppMode } from '../types';

interface HeaderProps {
  onOpenWindowsModal: () => void;
  onOpenHelpModal: () => void;
  onLoadSamples: () => void;
  totalImages: number;
  activeMode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenWindowsModal,
  onOpenHelpModal,
  onLoadSamples,
  totalImages,
  activeMode,
  onModeChange,
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();

  return (
    <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur text-slate-100 sticky top-0 z-30 shadow-md">
      {/* Windows App Window Titlebar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950/80 border-b border-slate-800/80 text-xs select-none">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center text-[9px] font-black text-white shadow-sm">
            1:1
          </div>
          <span className="font-medium tracking-wide text-slate-300">
            squareimage by bijit
          </span>
          <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
            v1.1.0 (Windows Desktop Edition)
          </span>
        </div>

        {/* Windows Window Controls */}
        <div className="flex items-center gap-1.5">
          <button
            title="Minimize"
            className="w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <span className="w-2.5 h-[1.5px] bg-current rounded-full" />
          </button>
          <button
            title="Maximize"
            className="w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <span className="w-2.5 h-2.5 border border-current rounded-xs" />
          </button>
          <button
            title="Close"
            className="w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-white hover:bg-rose-600 transition"
          >
            <span className="text-[10px] font-bold leading-none">&times;</span>
          </button>
        </div>
      </div>

      {/* Main Software Header & Action Toolbar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-blue-600 p-[1.5px] shadow-lg shadow-sky-500/10">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white/90 rounded-sm flex items-center justify-center relative shadow-inner">
                  <div className="w-3 h-2 bg-sky-400/80 rounded-[1px]" />
                </div>
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-[8px] font-bold px-1 rounded text-slate-950">
              1:1
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">
                squareimage <span className="text-sky-400 font-normal">by bijit</span>
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded-full">
                Desktop Image Suite
              </span>
            </div>
            <p className="text-xs text-slate-400">
              1:1 Whiteboard Square Conversion &amp; HEIC/All-Format to JPEG Converter
            </p>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => onModeChange('whiteboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeMode === 'whiteboard'
                ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Square className="w-3.5 h-3.5" />
            <span>1:1 Whiteboard Square</span>
          </button>

          <button
            type="button"
            onClick={() => onModeChange('heic-to-jpeg')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition relative ${
              activeMode === 'heic-to-jpeg'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>HEIC / All &rarr; JPEG</span>
            <span className={`text-[9px] px-1 py-0.2 rounded font-bold uppercase tracking-wider ${
              activeMode === 'heic-to-jpeg'
                ? 'bg-slate-950/30 text-slate-950'
                : 'bg-amber-500/20 text-amber-300'
            }`}>
              New
            </span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {activeMode === 'whiteboard' && totalImages === 0 && (
            <button
              onClick={onLoadSamples}
              id="btn-load-samples"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              title="Load demo images to test conversion"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Load Samples</span>
            </button>
          )}

          {isInstallable && !isInstalled && (
            <button
              onClick={install}
              id="btn-install-pwa"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/20 transition"
              title="Install as native Windows desktop software"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Install to Windows</span>
            </button>
          )}

          <button
            onClick={onOpenWindowsModal}
            id="btn-windows-exe-package"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition"
          >
            <Package className="w-3.5 h-3.5 text-indigo-400" />
            <span>Windows .EXE &amp; Package</span>
          </button>

          <button
            onClick={onOpenHelpModal}
            id="btn-help-modal"
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
            title="Help & How It Works"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
