import React, { useCallback } from 'react';
import { Upload } from 'lucide-react';

interface UploaderProps {
  onImageSelected: (files: File[]) => void;
}

const Uploader: React.FC<UploaderProps> = ({ onImageSelected }) => {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const files: File[] = [];
        Array.from(e.dataTransfer.files).forEach((file) => {
          if (file.type.startsWith('image/')) {
            files.push(file);
          }
        });
        if (files.length > 0) {
          onImageSelected(files);
        }
      }
    },
    [onImageSelected]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      onImageSelected(files);
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="w-full max-w-2xl mx-auto h-64 border-2 border-dashed border-slate-300 rounded-2xl bg-white flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-300 group"
    >
      <input
        type="file"
        accept="image/*"
        multiple // Enable multiple file selection
        onChange={handleChange}
        className="hidden"
        id="image-upload"
      />
      <label
        htmlFor="image-upload"
        className="flex flex-col items-center justify-center w-full h-full cursor-pointer"
      >
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
          <Upload className="w-8 h-8 text-slate-500 group-hover:text-indigo-600" />
        </div>
        <h3 className="text-xl font-semibold text-slate-700 mb-2">
          上传图片 (支持批量)
        </h3>
        <p className="text-slate-500 text-sm max-w-xs text-center">
          点击浏览或将多张图片拖拽至此处<br/>(支持 JPG, PNG, WebP)
        </p>
      </label>
    </div>
  );
};

export default Uploader;
