import { Component, EventEmitter, Output } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Pencil } from '../../../interfaces/pencil.interface';
import { brushTypes } from '../../../constants/pencils.constant';
import { MatTooltipModule } from '@angular/material/tooltip';

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

  constructor() {
    this.selectedColor = '#000000';
  }
  public onClick() {
    console.log("Button clicked!");
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

  public selectBrush(brush: Pencil): void {
    this.currentBrushType = brush;
    this.brushTypeChanged.emit(brush);
  }
}
