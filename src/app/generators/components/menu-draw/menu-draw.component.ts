import { Component, EventEmitter, model, OnInit, Output } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Pencil } from '../../../interfaces/pencil.interface';
import { brushTypes } from '../../../constants/pencils.constant';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ModelService } from '../../../services/model.service';
import { ResponseOut } from '../../../interfaces/response.out';
import { Model } from '../../../interfaces/model.interface';
import { MatDialog } from '@angular/material/dialog';
import { ErrorDialogComponent } from '../../../components/error-dialog/error-dialog.component';
import { environment } from '../../../../enviroments/environments';
import { FormParamsComponent } from '../form-params/form-params.component';

@Component({
  selector: 'app-menu-draw',
  imports: [MatButton, MatIconModule, MatMenuModule, MatTooltipModule],
  templateUrl: './menu-draw.component.html',
  styleUrl: './menu-draw.component.scss'
})
export class MenuDrawComponent {
  selectedColor: string;

  @Output()
  colorSelected = new EventEmitter<string>();
  @Output()
  eraseSelected = new EventEmitter<void>();
  @Output()
  brushSizeChanged = new EventEmitter<number>();
  @Output()
  deleteModeSelected = new EventEmitter<void>();
  @Output()
  brushTypeChanged = new EventEmitter<Pencil>();

  public brushSize = 5;
  public brushTypes: Pencil[] = brushTypes;
  public currentBrushType = this.brushTypes[0];
  public models: Model[]
  public currentModel?: Model;

  constructor(private dialog: MatDialog) {
    this.selectedColor = '#000000';
    this.models = [];
  }

  public openColorPicker() {
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.value = this.selectedColor;

    colorInput.addEventListener('input', (event: any) => {
      this.selectedColor = event.target.value;
      this.onColorSelected(this.selectedColor);
    });

    colorInput.click();
  }

  public openFormSettings() : void {
    const dialogRef = this.dialog.open(FormParamsComponent, {
      disableClose: false,
      panelClass: 'custom-dialog',
    });
  }

  public onColorSelected(color: string) {
    this.colorSelected.emit(color);
  }
  public onEraseSelected() {
    this.eraseSelected.emit();
  }
  public onBrushSizeChange(size: number) {
    this.brushSize = size;
    this.brushSizeChanged.emit(size);
  }

  public onDeleteModeSelected() {
    this.deleteModeSelected.emit();
  }
  public selectModel(model: Model): void {
    this.currentModel = model;
  }
  public selectBrush(brush: Pencil): void {
    this.currentBrushType = brush;
    this.brushTypeChanged.emit(brush);
  }
}
