import React, { useState, useEffect } from 'react';
import Uploader from './components/Uploader';
import Controls from './components/Controls';
import ResultGrid from './components/ResultGrid';
import { sliceImage, downloadBatchSlices, downloadAllSlices } from './services/imageProcessing';
import { GridConfig, BatchItem } from './types';
import { Scissors, Github, Image as ImageIcon, Trash2, CheckCircle2, AlertCircle, Archive, RefreshCw, Plus } from 'lucide-react';

const App: React.FC = () => {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [config, setConfig] = useState<GridConfig>({ rows: 3, cols: 3 });
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle new file selection (append to existing)
  const handleImagesSelected = (files: File[]) => {
    const newItems: BatchItem[] = files.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      previewUrl: URL.createObjectURL(file),
      status: 'idle'
    }));
    setItems(prev => [...prev, ...newItems]);
  };

  // Process all images
  const handleProcess = async () => {
    if (items.length === 0) return;

    setIsProcessing(true);
    
    // Process sequentially to avoid freezing UI too much, though parallel is possible
    const newItems = [...items];
    
    try {
        const processPromises = newItems.map(async (item) => {
            if (item.status === 'done' && item.slices) return item; 
            
            try {
                const slices = await sliceImage(item.file, config);
                return { ...item, slices, status: 'done' as const };
            } catch (e) {
                console.error(e);
                return { ...item, status: 'error' as const };
            }
        });

        const results = await Promise.all(processPromises);
        setItems(results);
    } catch (error) {
        console.error('Batch processing error:', error);
        alert('处理过程中发生错误');
    } finally {
        setIsProcessing(false);
    }
  };

  const handleClearImages = () => {
    // Revoke all URLs
    items.forEach(item => {
        URL.revokeObjectURL(item.previewUrl);
        item.slices?.forEach(s => URL.revokeObjectURL(s.url));
    });
    setItems([]);
    // Note: We deliberately do NOT reset config here to allow processing next images with same settings
  };

  const handleReset = () => {
    handleClearImages();
    setConfig({ rows: 3, cols: 3 });
  };

  const removeItem = (id: string) => {
    setItems(prev => {
        const itemToRemove = prev.find(i => i.id === id);
        if (itemToRemove) {
            URL.revokeObjectURL(itemToRemove.previewUrl);
            itemToRemove.slices?.forEach(s => URL.revokeObjectURL(s.url));
        }
        return prev.filter(i => i.id !== id);
    });
  };

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      items.forEach(item => {
        URL.revokeObjectURL(item.previewUrl);
        item.slices?.forEach(s => URL.revokeObjectURL(s.url));
      });
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const hasProcessedItems = items.some(i => i.status === 'done');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <Scissors className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              GridSplitter 靖哥哥AI版
            </h1>
          </div>
          <a
            href="#"
            className="text-slate-500 hover:text-indigo-600 transition-colors"
            title="View on GitHub"
          >
            <Github className="w-5 h-5" />
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {items.length === 0 ? (
          <div className="mt-12 animate-fade-in-up">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold text-slate-800 mb-3">
                将图片切割成完美的九宫格或拼图
              </h2>
              <p className="text-slate-500 max-w-xl mx-auto">
                上传单张或多张图片，一键批量切割成九宫格 (3x3) 或自定义网格。
                <br/>适用于微信朋友圈、Instagram 等社交媒体。完全免费，本地处理。
              </p>
            </div>
            <Uploader onImageSelected={handleImagesSelected} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4 animate-fade-in">
            {/* Sidebar Controls */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 sticky top-24">
                 {/* Preview of the first image to show config effect */}
                 <div className="mb-4">
                     <h3 className="text-sm font-medium text-slate-500 mb-2">预览 (首张图片)</h3>
                     <div className="aspect-auto max-h-48 w-full rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center relative">
                        <img
                          src={items[0].previewUrl}
                          alt="Preview"
                          className="max-h-48 w-full object-contain"
                        />
                        <div 
                            className="absolute inset-0 pointer-events-none border-2 border-indigo-500/50"
                            style={{
                            display: 'grid',
                            gridTemplateColumns: `repeat(${config.cols}, 1fr)`,
                            gridTemplateRows: `repeat(${config.rows}, 1fr)`,
                            }}
                        >
                            {Array.from({ length: config.rows * config.cols }).map((_, i) => (
                            <div key={i} className="border border-indigo-500/30"></div>
                            ))}
                        </div>
                     </div>
                 </div>

                <Controls
                  config={config}
                  onChange={setConfig}
                  onReset={handleReset}
                  onProcess={handleProcess}
                  isProcessing={isProcessing}
                />
                
                {hasProcessedItems && (
                    <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
                        <button
                            onClick={() => downloadBatchSlices(items)}
                            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-md shadow-green-200 transition-all flex justify-center items-center gap-2"
                        >
                            <Archive className="w-5 h-5" />
                            下载所有图片 (ZIP)
                        </button>

                        <button
                            onClick={handleClearImages}
                            className="w-full py-3 bg-white border-2 border-slate-100 hover:border-indigo-500 hover:text-indigo-600 text-slate-600 font-medium rounded-lg transition-all flex justify-center items-center gap-2"
                        >
                            <RefreshCw className="w-5 h-5" />
                            处理下一张 (清空当前)
                        </button>
                    </div>
                )}
                
                <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                    <label className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 cursor-pointer font-medium py-2 px-4 rounded-lg hover:bg-indigo-50 transition-colors">
                        <Plus className="w-4 h-4" />
                        添加更多图片
                        <input type="file" multiple accept="image/*" onChange={(e) => e.target.files && handleImagesSelected(Array.from(e.target.files))} className="hidden" />
                    </label>
                </div>
              </div>
            </div>

            {/* Main Content List */}
            <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-slate-800">
                  图片列表 ({items.length})
                </h2>
                {isProcessing && <span className="text-sm text-indigo-600 animate-pulse">正在处理...</span>}
              </div>

              {/* Special Single Item View if only 1 item */}
              {items.length === 1 && items[0].status === 'done' && items[0].slices ? (
                 <ResultGrid slices={items[0].slices} config={config} />
              ) : (
                /* Batch List View */
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 transition-all hover:shadow-md">
                        <div className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 border border-slate-100">
                            <img src={item.previewUrl} className="w-full h-full object-cover" alt="thumbnail" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-slate-800 truncate" title={item.file.name}>{item.file.name}</h4>
                            <p className="text-xs text-slate-500 mt-1">
                                {(item.file.size / 1024).toFixed(1)} KB
                            </p>
                            <div className="mt-2 flex items-center gap-2">
                                {item.status === 'done' ? (
                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                        <CheckCircle2 className="w-3 h-3" /> 已完成 ({item.slices?.length} 片)
                                    </span>
                                ) : item.status === 'error' ? (
                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                                        <AlertCircle className="w-3 h-3" /> 失败
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full">
                                        待处理
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                             {item.status === 'done' && item.slices && (
                                <button 
                                    onClick={() => downloadAllSlices(item.slices!, item.file.name.split('.')[0] + '_grid')}
                                    className="p-2 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                    title="下载此图切片"
                                >
                                    <Archive className="w-5 h-5" />
                                </button>
                             )}
                             <button 
                                onClick={() => removeItem(item.id)}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="移除"
                             >
                                <Trash2 className="w-5 h-5" />
                             </button>
                        </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;