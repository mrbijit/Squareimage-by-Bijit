import React from 'react';
import {
  Palette,
  Sliders,
  Maximize2,
  FileImage,
  Sparkles,
  RotateCcw,
  Check,
} from 'lucide-react';
import { ConversionSettings, WhiteboardBgType, TargetDimensionType, ExportFormat } from '../types';

interface ControlsPanelProps {
  settings: ConversionSettings;
  onChange: (newSettings: ConversionSettings) => void;
  onReset: () => void;
  disabled?: boolean;
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  settings,
  onChange,
  onReset,
  disabled = false,
}) => {
  const updateSetting = <K extends keyof ConversionSettings>(
    key: K,
    val: ConversionSettings[K]
  ) => {
    onChange({
      ...settings,
      [key]: val,
    });
  };

  const bgOptions: { id: WhiteboardBgType; label: string; previewClass: string }[] = [
    { id: 'white', label: 'White', previewClass: 'bg-white border-slate-300' },
    { id: 'offwhite', label: 'Soft White', previewClass: 'bg-slate-100 border-slate-300' },
    { id: 'black', label: 'Black', previewClass: 'bg-black border-slate-700' },
    { id: 'slate', label: 'Slate', previewClass: 'bg-slate-900 border-slate-700' },
    { id: 'blur', label: 'Blur', previewClass: 'bg-gradient-to-tr from-sky-400 via-indigo-400 to-rose-400 opacity-80' },
    { id: 'transparent', label: 'Transparent', previewClass: 'bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:6px_6px] bg-slate-800' },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
            <Sliders className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            Whiteboard Studio Settings
          </h3>
        </div>
        <button
          type="button"
          onClick={onReset}
          disabled={disabled}
          title="Reset to default whiteboard settings"
          className="text-xs text-slate-400 hover:text-slate-200 inline-flex items-center gap-1 transition"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* 1. Whiteboard Canvas Background */}
      <div className="space-y-2.5">
        <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-sky-400" />
            <span>Whiteboard Background</span>
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            {settings.bgType === 'custom' ? settings.customBgColor : settings.bgType}
          </span>
        </label>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {bgOptions.map((opt) => {
            const isSelected = settings.bgType === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => updateSetting('bgType', opt.id)}
                disabled={disabled}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border text-center transition ${
                  isSelected
                    ? 'border-sky-500 bg-sky-950/30 text-white shadow-sm ring-1 ring-sky-500/50'
                    : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg border shadow-xs flex items-center justify-center ${opt.previewClass}`}
                >
                  {isSelected && (
                    <Check className={`w-3.5 h-3.5 ${opt.id === 'white' || opt.id === 'offwhite' ? 'text-slate-900' : 'text-white'}`} />
                  )}
                </div>
                <span className="text-[11px] font-medium leading-tight">{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Custom Color Input */}
        <div className="pt-1 flex items-center gap-2">
          <input
            type="color"
            value={settings.customBgColor}
            onChange={(e) => {
              updateSetting('bgType', 'custom');
              updateSetting('customBgColor', e.target.value);
            }}
            disabled={disabled}
            className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
            title="Choose custom background color"
          />
          <button
            type="button"
            onClick={() => updateSetting('bgType', 'custom')}
            className={`text-xs px-2.5 py-1 rounded-md border transition ${
              settings.bgType === 'custom'
                ? 'border-sky-500 bg-sky-950/40 text-sky-300 font-medium'
                : 'border-slate-800 text-slate-400 hover:text-slate-300'
            }`}
          >
            Custom Color Picker ({settings.customBgColor})
          </button>
        </div>
      </div>

      {/* 2. Whiteboard Margin / Padding */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <label className="font-medium text-slate-300">Whiteboard Margin / Padding</label>
          <span className="font-mono text-sky-400 font-semibold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
            {settings.paddingPercent}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="30"
          step="1"
          value={settings.paddingPercent}
          onChange={(e) => updateSetting('paddingPercent', parseInt(e.target.value, 10))}
          disabled={disabled}
          className="w-full accent-sky-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
        />
        <div className="flex justify-between text-[10px] text-slate-500">
          <span>0% (Flush to border)</span>
          <span>10% (Balanced)</span>
          <span>30% (Wide Mat)</span>
        </div>
      </div>

      {/* 3. Target 1:1 Output Dimension */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Maximize2 className="w-3.5 h-3.5 text-sky-400" />
            <span>Output Square Resolution (1:1)</span>
          </span>
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: 'original-max', label: 'Lossless Max', desc: 'Preserves 100% DPI' },
            { id: '1080', label: '1080 × 1080', desc: 'Standard HD' },
            { id: '1200', label: '1200 × 1200', desc: 'Web & E-comm' },
            { id: '2048', label: '2048 × 2048', desc: '2K High-Res' },
          ].map((dim) => {
            const isSelected = settings.targetDimension === dim.id;
            return (
              <button
                key={dim.id}
                type="button"
                onClick={() => updateSetting('targetDimension', dim.id as TargetDimensionType)}
                disabled={disabled}
                className={`p-2 rounded-xl border text-left transition ${
                  isSelected
                    ? 'border-sky-500 bg-sky-950/40 text-white ring-1 ring-sky-500/40'
                    : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                }`}
              >
                <div className="text-xs font-semibold text-slate-200">{dim.label}</div>
                <div className="text-[10px] text-slate-500">{dim.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Embedded Photo Aesthetics */}
      <div className="pt-2 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Rounded Corners */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300">Image Corner Radius</span>
            <span className="font-mono text-slate-400">{settings.cornerRadius}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="40"
            step="2"
            value={settings.cornerRadius}
            onChange={(e) => updateSetting('cornerRadius', parseInt(e.target.value, 10))}
            disabled={disabled}
            className="w-full accent-sky-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>

        {/* Drop Shadow Toggle */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/50 border border-slate-800">
          <div>
            <div className="text-xs font-medium text-slate-300">Whiteboard Shadow</div>
            <div className="text-[10px] text-slate-500">Subtle floating studio elevation</div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.dropShadow}
              onChange={(e) => updateSetting('dropShadow', e.target.checked)}
              disabled={disabled}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
          </label>
        </div>
      </div>

      {/* 5. Export Format & Quality */}
      <div className="pt-3 border-t border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <FileImage className="w-3.5 h-3.5 text-sky-400" />
            <span>Export Format</span>
          </span>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {[
              { val: 'image/jpeg', label: 'JPG' },
              { val: 'image/png', label: 'PNG' },
              { val: 'image/webp', label: 'WEBP' },
            ].map((fmt) => (
              <button
                key={fmt.val}
                type="button"
                onClick={() => updateSetting('exportFormat', fmt.val as ExportFormat)}
                disabled={disabled}
                className={`text-xs px-2.5 py-1 rounded-md font-medium transition ${
                  settings.exportFormat === fmt.val
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {fmt.label}
              </button>
            ))}
          </div>
        </div>

        {settings.exportFormat !== 'image/png' && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Compression Quality</span>
              <span className="font-mono text-sky-400 font-semibold">
                {Math.round(settings.quality * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.0"
              step="0.02"
              value={settings.quality}
              onChange={(e) => updateSetting('quality', parseFloat(e.target.value))}
              disabled={disabled}
              className="w-full accent-sky-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>
        )}
      </div>
    </div>
  );
};
