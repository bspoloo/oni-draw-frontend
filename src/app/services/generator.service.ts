import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ImageToImageRequest, ImageToImageResponse } from '../interfaces/image-to-image.interfaces';
import { Observable } from 'rxjs';
import { TextToImageRequest, TextToImageResponse } from '../interfaces/text-to-image.interfaces';
import { environment } from '../../enviroments/environments';
import { ImageToSketchRequest, ImageToSketchResponse } from '../interfaces/image-to-sketch.interface';

@Injectable({
  providedIn: 'root'
})
export class GeneratorService {
  private apiUrl = `${environment.apiUrl}`;
  private callbackImproveImage: (() => void) | null | undefined;
  private callbackCanvasImage: ((file: File) => void ) | null | undefined;
  private callbackLoadImage: ((image: string) => void) | null | undefined;

  constructor(private http: HttpClient) {

  }

  public imageToImage(request: ImageToImageRequest): Observable<ImageToImageResponse> {
    const formData = new FormData();
    formData.append('file', request.file);

    const jsonData = {
      prompt: request.prompt,
      filename: request.filename || request.file.name,
      num_inference_steps: request.num_inference_steps || 50,
      strength: request.strength || 0.8,
      guidance_scale: request.guidance_scale || 7.5,
      num_images_per_prompt: request.num_images_per_prompt || 1,
      model_name: request.model_name || "sketch_to_anime_lora_final5"
    };

    formData.append('data', JSON.stringify(jsonData));

    return this.http.post<ImageToImageResponse>(
      `${this.apiUrl}/generator/image-to-image`, formData
    );
  }

  public imageToSketch(request: ImageToSketchRequest): Observable<ImageToSketchResponse> {
    const formData = new FormData();
    formData.append("file", request.file);

    return this.http.post<ImageToSketchResponse>(
      `${this.apiUrl}/generator/image-to-sketch`, formData
    );
  }

  public textToImage(request: TextToImageRequest): Observable<TextToImageResponse> {
    return this.http.post<TextToImageResponse>(
      `${this.apiUrl}/text-to-image`, request
    );
  }

  public getImageUrl(filename: string): string {
    return `${this.apiUrl}/files/results/${filename}`;
  }

  public registerCallbackImproveImage(fn: () => void): void {
    this.callbackImproveImage = fn;
  }

  public registerCallbackCanvasImage(fn: (file: File) => void ): void {
    this.callbackCanvasImage = fn;
  }

  public registerCallbackLoadImage(fn: (image: string) => void): void {
    this.callbackLoadImage = fn;
  }

  public triggerCallbackLoadImage(image: string): void {
    if (this.callbackLoadImage) {
      this.callbackLoadImage(image);
    } else {
      console.warn("No callback registered");
    }
  }

  public triggerCallbackCanvasImage(file: File): void  {
    console.log('recibiendo file', file);

    if (this.callbackCanvasImage) {
      this.callbackCanvasImage(file);
    } else {
      console.warn("No callback registered");
    }
  }

  public triggerCallbackImproveImage(): void {
    if (this.callbackImproveImage) {
      this.callbackImproveImage();
    } else {
      console.warn("No callback registered");
    }
  }
}
