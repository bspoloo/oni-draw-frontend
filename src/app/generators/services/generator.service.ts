import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ImageToImageRequest, ImageToImageResponse } from '../../interfaces/image-to-image.interfaces';
import { Observable } from 'rxjs';
import { TextToImageRequest, TextToImageResponse } from '../../interfaces/text-to-image.interfaces';

@Injectable({
  providedIn: 'root'
})
export class GeneratorService {
  private apiUrl = 'http://127.0.0.1:5000/api/generator';
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
    };

    formData.append('data', JSON.stringify(jsonData));

    return this.http.post<ImageToImageResponse>(
      `${this.apiUrl}/image-to-image`, formData
    );
  }

  public textToImage(request : TextToImageRequest): Observable<TextToImageResponse> {
    return this.http.post<TextToImageResponse>(
      `${this.apiUrl}/text-to-image`, request
    );
  }

  public getImageUrl(filename: string): string {
    return `${this.apiUrl}/result/${filename}`;
  }
}
