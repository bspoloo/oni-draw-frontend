import { Injectable } from '@angular/core';
import { environment } from '../../enviroments/environments';
import { Observable } from 'rxjs';
import { ResponseOut } from '../interfaces/response.out';
import { Model } from '../interfaces/model.interface';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class ModelService {
  private apiUrl: string;
  private currentModel?: Model;

  constructor(private http: HttpClient) {
    this.apiUrl = environment.apiUrl;
  }

  public getModels(): Observable<ResponseOut<Model[]>> {
    return this.http.get<ResponseOut<Model[]>>(
      `${this.apiUrl}/ai_models`
    );
  }
  public setCurrentModel(model: Model): void{
    this.currentModel = model;
  }
  public getCurrentModel() : Model | undefined{
    return this.currentModel;
  }
}
