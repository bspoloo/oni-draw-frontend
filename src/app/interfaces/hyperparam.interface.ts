export interface Hyperparam {
  prompt: string;
  num_inference_steps: number;
  num_images_per_prompt: number
  strength: number;
  guidance_scale: number;
  model_name: string
}
