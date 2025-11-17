export interface ImageToImageRequest {
  file: File;
  prompt: string;
  filename?: string;
  num_inference_steps?: number;
  strength?: number;
  guidance_scale?: number;
  num_images_per_prompt: number
  model_name: string
}
export interface ImageToImageResponse {
  status: 'success' | 'error';
  message?: string;
  filenames: string[];
}
