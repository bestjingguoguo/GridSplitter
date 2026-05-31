import React, { useState } from 'react';
import { Download, Archive, ZoomIn, ZoomOut } from 'lucide-react';
import { Slice, GridConfig } from '../types';
import { downloadSingleSlice, downloadAllSlices } from '../services/imageProcessing';

interface ResultGridProps {
  slices: Slice[];
  config: GridConfig;
}

const ResultGrid: React.FC<ResultGridProps> = ({ slices, config }) => {
  const [zoom, setZoom] = useState(100);

  if (slices.length === 0) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800">
            切分结果 ({slices.length} 张)
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            预览已设为完整显示模式（无裁剪），可调整下方滑块缩放视图
          </p>
        </div>
        
        <button
          onClick={() => downloadAllSlices(slices)}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg shadow-sm shadow-green-200 transition-all flex items-center gap-2"
        >
          <Archive className="w-4 h-4" />
          打包下载 (.zip)
        </button>
      </div>

      {/* View Controls */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center gap-4 max-w-md shadow-sm">
        <span className="text-xs font-medium text-slate-500 whitespace-nowrap">预览大小: {zoom}%</span>
        <div className="flex items-center gap-2 flex-1">
            <ZoomOut className="w-4 h-4 text-slate-400" />
            <input 
                type="range" 
                min="20" 
                max="100" 
                value={zoom} 
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <ZoomIn className="w-4 h-4 text-slate-400" />
        </div>
      </div>

      <div className="bg-slate-100/50 p-6 rounded-xl border border-slate-200/60 flex justify-center overflow-x-auto min-h-[300px] items-center">
        <div
            className="grid gap-1 bg-white shadow-sm transition-all duration-200 flex-shrink-0 origin-center"
            style={{
              gridTemplateColumns: `repeat(${config.cols}, minmax(0, 1fr))`,
              width: `${zoom}%`,
              minWidth: '200px'
            }}
        >
            {slices.map((slice) => (
            <div
                key={slice.id}
                className="relative group overflow-hidden bg-slate-50"
            >
                {/* Use w-full h-auto block to ensure full image is visible without cropping (aspect-square removed) */}
                <img
                  src={slice.url}
                  alt={`Part ${slice.row}-${slice.col}`}
                  className="w-full h-auto block"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <button
                      onClick={() => downloadSingleSlice(slice)}
                      className="p-2 bg-white rounded-full text-slate-900 hover:text-indigo-600 transform scale-90 group-hover:scale-100 transition-all shadow-lg"
                      title="下载单张"
                  >
                      <Download className="w-5 h-5" />
                  </button>
                </div>
            </div>
            ))}
        </div>
      </div>
      
      <div className="text-center text-sm text-slate-400">
        点击图片可单独下载，或点击右上角按钮打包下载。
      </div>
    </div>
  );
};

export default ResultGrid;