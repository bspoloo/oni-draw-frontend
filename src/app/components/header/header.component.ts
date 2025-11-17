import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { GeneratorService } from '../../services/generator.service';
import { CameraComponent } from '../camera/camera.component';
import { MatDialog } from '@angular/material/dialog';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';

@Component({
  selector: 'app-header',
  imports: [MatButtonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(private generatorService: GeneratorService, private dialog: MatDialog) {

  }
  public improveImage(): void {
    this.generatorService.triggerCallbackImproveImage();
  }

  public openCamera(): void {
    const dialogRef = this.dialog.open(CameraComponent, {
      disableClose: false,
      panelClass: 'custom-dialog',
    });
  }

  public async onFileSelected(event: any): Promise<void> {
    const file: File = event.target.files[0];
    console.log(file);

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      const dialogRefError = this.dialog.open(ErrorDialogComponent, {
        disableClose: true,
        data: { message: `Por favor, selecciona un archivo de imagen` },
        panelClass: 'custom-dialog',
      });
      return;
    }

    this.generatorService.triggerCallbackCanvasImage(file);
    event.target.value = '';
  }
  public openFilePicker(): void {
    this.fileInput.nativeElement.click();
  }
}
