import { Component, EventEmitter, Inject, OnDestroy, OnInit, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Hyperparam } from '../../../interfaces/hyperparam.interface';
import { MatSliderModule } from '@angular/material/slider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ModelService } from '../../../services/model.service';
import { ResponseOut } from '../../../interfaces/response.out';
import { Model } from '../../../interfaces/model.interface';
import { environment } from '../../../../enviroments/environments';
import { ErrorDialogComponent } from '../../../components/error-dialog/error-dialog.component';
import { MatCardModule } from '@angular/material/card';
import { MatTooltip } from '@angular/material/tooltip';
import { HyperparamsService } from '../../../services/hyperparams.service';

@Component({
  selector: 'app-form-params',
  imports: [FormsModule, ReactiveFormsModule, MatSliderModule, MatFormFieldModule, MatInputModule, MatButtonModule, DecimalPipe, CommonModule, MatCardModule, MatTooltip],
  templateUrl: './form-params.component.html',
  styleUrl: './form-params.component.scss'
})
export class FormParamsComponent implements OnInit, OnDestroy {

  @Output()
  public paramsGenerate: EventEmitter<Hyperparam> = new EventEmitter<Hyperparam>();
  @Output()
  public paramsImprove: EventEmitter<Hyperparam> = new EventEmitter<Hyperparam>();
  // public hyperparams: Hyperparam;
  public form: FormGroup;
  public models: Model[]
  public loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<FormParamsComponent>,
    private modelService: ModelService,
    private dialog: MatDialog,
    private hyperparamService: HyperparamsService,
    // @Inject(MAT_DIALOG_DATA) public data: { message: string }
  ) {
    this.models = [];

    const hyperparams = this.hyperparamService.getHyperparmas();

    this.form = this.fb.group({
      prompt: [hyperparams.prompt],
      num_inference_steps: [hyperparams.num_inference_steps],
      strength: [hyperparams.strength],
      num_images_per_prompt: [hyperparams.num_images_per_prompt],
      guidance_scale: [hyperparams.guidance_scale],
    });
  }
  public ngOnDestroy(): void {
    const hyperparams : Hyperparam = this.form.value as Hyperparam;
    hyperparams.model_name = this.modelService.getCurrentModel()?.model_id || "sketch_to_anime_lora_final5";
    hyperparams.prompt = this.modelService.getCurrentModel()?.prompt || "draw style masterpiece"
    this.hyperparamService.setHyperParams(hyperparams);
  }
  public ngOnInit(): void {

    this.loading = true;
    this.modelService.getModels().subscribe({
      next: (response: ResponseOut<Model[]>) => {

        this.models = response.data.map((model: Model) => {
          if (!model.image.startsWith('http')) {
            model.image = `${environment.apiUrl}/files/models/${model.image}`;
          }
          return model;
        })
        if (!this.modelService.getCurrentModel()) {
          this.modelService.setCurrentModel(response.data[0]);
        }
        this.loading = false
      },
      error: (error) => {
        this.loading = true;
        const dialogRefError = this.dialog.open(ErrorDialogComponent, {
          disableClose: true,
          data: { message: `Error al traer modelos: ${error.message}` },
          panelClass: 'custom-dialog',
        });
      }
    });
  }

  public selectModel(model: Model): void {
    this.modelService.setCurrentModel(model);
  }
  public getCurrentModel(): Model | undefined {
    return this.modelService.getCurrentModel();
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
  // public generateImage(): void {
  //   this.paramsGenerate.emit(this.form.value);
  // }
  // public improveImage(): void {
  //   // this.paramsImprove.emit(this.form.value);
  //   console.log(this.modelService.getCurrentModel());

  // }
}
