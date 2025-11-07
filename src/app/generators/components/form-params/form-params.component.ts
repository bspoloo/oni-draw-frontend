import { Component, EventEmitter, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Hyperparam } from '../../../interfaces/hyperparam.interface';
import { MatSliderModule } from '@angular/material/slider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-form-params',
  imports: [FormsModule, ReactiveFormsModule, MatSliderModule, MatFormFieldModule, MatInputModule, MatButtonModule, DecimalPipe, CommonModule],
  templateUrl: './form-params.component.html',
  styleUrl: './form-params.component.scss'
})
export class FormParamsComponent {

  @Output()
  public paramsGenerate: EventEmitter<Hyperparam> = new EventEmitter<Hyperparam>();
  @Output()
  public paramsImprove: EventEmitter<Hyperparam> = new EventEmitter<Hyperparam>();
  public hyperparams: Hyperparam;
  public form: FormGroup;


  constructor(private fb: FormBuilder) {
    this.hyperparams = {
      prompt: 'anime style, high quality, detailed, hair with vibrant colors, masterpiece, best quality',
      num_inference_steps: 50,
      num_images_per_prompt: 1,
      strength: 0.70,
      guidance_scale: 9.0
    };

    this.form = this.fb.group({
      prompt: [this.hyperparams.prompt],
      num_inference_steps: [this.hyperparams.num_inference_steps],
      strength: [this.hyperparams.strength],
      num_images_per_prompt: [this.hyperparams.num_images_per_prompt],
      guidance_scale: [this.hyperparams.guidance_scale]
    });
  }
  public errorMessage(field: string): string {
    if (this.form.controls[field].hasError('required')) {
      return 'This field is required';
    }
    if (this.form.controls[field].hasError('min')) {
      return 'Value is too low';
    }
    if (this.form.controls[field].hasError('max')) {
      return 'Value is too high';
    }
    return '';
  }
  public generateImage(): void {
    this.paramsGenerate.emit(this.form.value);
  }
  public improveImage(): void {
    this.paramsImprove.emit(this.form.value);
  }
}
