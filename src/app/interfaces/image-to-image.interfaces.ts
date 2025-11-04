export interface ImageToImageRequest {
  file: File;
  prompt: string;
  filename?: string;
  num_inference_steps?: number;
  strength?: number;
  guidance_scale?: number;
}
export interface ImageToImageResponse {
  status: 'success' | 'error';
  message?: string;
  filename?: string;
}
