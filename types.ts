export interface Slice {
  id: string;
  url: string;
  blob: Blob;
  fileName: string;
  row: number;
  col: number;
}

export interface GridConfig {
  rows: number;
  cols: number;
}

export interface BatchItem {
  id: string;
  file: File;
  previewUrl: string;
  slices?: Slice[];
  status: 'idle' | 'processing' | 'done' | 'error';
}
