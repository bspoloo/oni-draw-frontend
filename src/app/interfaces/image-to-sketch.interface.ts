export interface ImageToSketchRequest {
  file: File;
}
export interface ImageToSketchResponse {
  status: 'success' | 'error';
  message?: string;
  filenames: string[];
}
