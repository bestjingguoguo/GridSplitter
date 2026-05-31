import JSZip from 'jszip';
import saveAs from 'file-saver';
import { Slice, GridConfig, BatchItem } from '../types';

export const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = url;
  });
};

export const sliceImage = async (
  imageSource: string | File,
  config: GridConfig
): Promise<Slice[]> => {
  let img: HTMLImageElement;
  let revokeUrl = false;
  let objectUrl = '';

  try {
    if (typeof imageSource === 'string') {
      img = await loadImage(imageSource);
    } else {
      objectUrl = URL.createObjectURL(imageSource);
      revokeUrl = true;
      img = await loadImage(objectUrl);
    }

    const { rows, cols } = config;
    const sliceWidth = Math.floor(img.naturalWidth / cols);
    const sliceHeight = Math.floor(img.naturalHeight / rows);
    const slices: Slice[] = [];

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Canvas context not available');
    }

    canvas.width = sliceWidth;
    canvas.height = sliceHeight;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Clear canvas for next slice
        ctx.clearRect(0, 0, sliceWidth, sliceHeight);

        // Draw specific section of the source image
        ctx.drawImage(
          img,
          c * sliceWidth, // Source X
          r * sliceHeight, // Source Y
          sliceWidth, // Source Width
          sliceHeight, // Source Height
          0, // Dest X
          0, // Dest Y
          sliceWidth, // Dest Width
          sliceHeight // Dest Height
        );

        // Convert to blob
        const blob = await new Promise<Blob | null>((resolve) => 
          canvas.toBlob(resolve, 'image/png', 1.0)
        );

        if (blob) {
          const sliceUrl = URL.createObjectURL(blob);
          slices.push({
            id: `slice-${r}-${c}-${Date.now()}-${Math.random()}`,
            url: sliceUrl,
            blob,
            fileName: `slice_${r + 1}_${c + 1}.png`,
            row: r,
            col: c
          });
        }
      }
    }

    return slices;
  } finally {
    if (revokeUrl && objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }
  }
};

export const downloadAllSlices = async (slices: Slice[], baseName: string = 'split_images') => {
  const zip = new JSZip();
  const folder = zip.folder(baseName);

  if (!folder) return;

  slices.forEach((slice) => {
    folder.file(slice.fileName, slice.blob);
  });

  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, `${baseName}.zip`);
};

export const downloadSingleSlice = (slice: Slice) => {
  saveAs(slice.blob, slice.fileName);
};

export const downloadBatchSlices = async (items: BatchItem[], baseName: string = 'batch_grid_export') => {
  const zip = new JSZip();
  const rootFolder = zip.folder(baseName);

  if (!rootFolder) return;

  items.forEach((item, index) => {
    if (!item.slices || item.status !== 'done') return;
    
    // Create a subfolder for each image.
    // Use filename without extension to name the folder, fallback to index if needed
    const safeName = item.file.name.replace(/\.[^/.]+$/, "").replace(/[^a-z0-9]/gi, '_');
    const folderName = `${safeName}_${index + 1}`;
    
    const imgFolder = rootFolder.folder(folderName);
    
    if (imgFolder) {
      item.slices.forEach(slice => {
        imgFolder.file(slice.fileName, slice.blob);
      });
    }
  });

  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, `${baseName}.zip`);
};
