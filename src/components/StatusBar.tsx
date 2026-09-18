import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cpu, HardDrive, Sparkles, WifiOff, CheckCircle2, Archive, ArrowRightLeft } from 'lucide-react';
import { ConversionSettings, AppMode } from '../types';

interface StatusBarProps {
  totalCount: number;
  readyCount: number;
  isProcessing: boolean;
  settings: ConversionSettings;
  activeMode?: AppMode;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  totalCount,
  readyCount,
  isProcessing,
  settings,
  activeMode = 'whiteboard',
}) => {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 select-none">
      <div className="flex items-center gap-4 flex-wrap">
        {activeMode === 'whiteboard' ? (
          <>
            <div className="flex items-center gap-1.5 font-medium text-slate-300">
              <span
                className={`w-2 h-2 rounded-full ${
                  isProcessing
                    ? 'bg-amber-400 animate-ping'
                    : readyCount > 0
                    ? 'bg-emerald-400'
                    : 'bg-slate-500'
                }`}
              />
              <span>
                {isProcessing
                  ? 'Processing images to 1:1...'
                  : readyCount > 0
                  ? `${readyCount} of ${totalCount} images ready`
                  : 'Ready for images'}
              </span>
            </div>

            <span className="text-slate-700 hidden sm:inline">|</span>

            <div className="flex items-center gap-1 text-[11px] text-slate-400 hidden sm:flex">
              <span>Whiteboard:</span>
              <span className="font-semibold text-slate-200">
                {settings.bgType === 'custom'
                  ? settings.customBgColor
                  : settings.bgType === 'white'
                  ? 'Pure White'
                  : settings.bgType === 'offwhite'
                  ? 'Soft White'
                  : settings.bgType}
              </span>
              {settings.paddingPercent > 0 && (
                <span className="text-sky-400">({settings.paddingPercent}% margin)</span>
              )}
            </div>

            <span className="text-slate-700 hidden md:inline">|</span>

            <div className="flex items-center gap-1 text-[11px] text-slate-400 hidden md:flex">
              <span>Target Ratio:</span>
              <span className="font-semibold text-sky-300">1:1 Square (No Cropping)</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-1.5 font-medium text-amber-400">
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>HEIC &amp; All Formats &rarr; JPEG Converter</span>
            </div>

            <span className="text-slate-700 hidden sm:inline">|</span>

            <div className="flex items-center gap-1 text-[11px] text-slate-300 hidden sm:flex">
              <span>Save Options:</span>
              <span className="text-emerald-400 font-semibold">One-by-One or All at Once (.ZIP)</span>
            </div>
          </>
        )}

        <span className="text-slate-700 hidden lg:inline">|</span>

        {/* Offline ZIP indicator */}
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 hidden lg:flex font-medium">
          <Archive className="w-3.5 h-3.5 text-emerald-400" />
          <span>Local ZIP Engine Active</span>
        </div>
      </div>

      <div className="flex items-center gap-3 text-[11px] text-slate-400">
        {!isOnline ? (
          <div className="flex items-center gap-1 text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
            <WifiOff className="w-3 h-3" />
            <span>Offline Mode Active • Local ZIP Available</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">100% Client-Side &amp; Offline Ready</span>
          </div>
        )}

        <span className="text-slate-700">|</span>

        <span className="font-mono text-slate-400">
          squareimage <span className="text-sky-400">by bijit</span>
        </span>
      </div>
    </footer>
  );
};

