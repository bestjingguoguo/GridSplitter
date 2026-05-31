import React from 'react';
import { Grid3x3, LayoutGrid, RotateCcw } from 'lucide-react';
import { GridConfig } from '../types';

interface ControlsProps {
  config: GridConfig;
  onChange: (config: GridConfig) => void;
  onReset: () => void;
  onProcess: () => void;
  isProcessing: boolean;
}

const Controls: React.FC<ControlsProps> = ({
  config,
  onChange,
  onReset,
  onProcess,
  isProcessing,
}) => {
  const handlePreset = (r: number, c: number) => {
    onChange({ rows: r, cols: c });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 1;
    const name = e.target.name;
    onChange({ ...config, [name]: Math.max(1, Math.min(10, val)) });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <LayoutGrid className="w-5 h-5 text-indigo-600" />
          网格设置
        </h2>
        <button
          onClick={onReset}
          className="text-slate-400 hover:text-red-500 transition-colors"
          title="重置"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Quick Presets */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handlePreset(2, 2)}
            className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
              config.rows === 2 && config.cols === 2
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            2 x 2
          </button>
          <button
            onClick={() => handlePreset(3, 3)}
            className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
              config.rows === 3 && config.cols === 3
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            3 x 3
          </button>
          <button
            onClick={() => handlePreset(4, 4)}
            className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
              config.rows === 4 && config.cols === 4
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            4 x 4
          </button>
        </div>

        {/* Custom Inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              行数 (Rows)
            </label>
            <input
              type="number"
              name="rows"
              min="1"
              max="10"
              value={config.rows}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              列数 (Cols)
            </label>
            <input
              type="number"
              name="cols"
              min="1"
              max="10"
              value={config.cols}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
        </div>

        <button
          onClick={onProcess}
          disabled={isProcessing}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md shadow-indigo-200 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              处理中...
            </>
          ) : (
            <>
              <Grid3x3 className="w-4 h-4" />
              开始切分
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Controls;