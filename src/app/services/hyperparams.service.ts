import { Injectable } from '@angular/core';
import { Hyperparam } from '../interfaces/hyperparam.interface';

@Injectable({
  providedIn: 'root'
})
export class HyperparamsService {

  private hyperparams: Hyperparam;
  constructor() {
    this.hyperparams = {
      prompt: 'anime style, high quality, detailed, hair with vibrant colors, masterpiece, best quality',
      num_inference_steps: 50,
      num_images_per_prompt: 1,
      strength: 0.70,
      guidance_scale: 9.0,
      model_name: "sketch_to_anime_lora_final5"
    };
  }

  public getHyperparmas(): Hyperparam {
    return this.hyperparams;
  }
  public setHyperParams(hyperparm: Hyperparam): void {
    this.hyperparams = hyperparm;
  }
}
