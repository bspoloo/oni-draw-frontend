export interface TextToImageRequest {
  prompt: string;
  filename?: string;
  num_inference_steps?: number;
  strength?: number;
  guidance_scale?: number;
  num_images_per_prompt: number
}
export interface TextToImageResponse {
  status: 'success' | 'error';
  message?: string;
  filenames?: string[];
}
