import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { GeneratorService } from '../../services/generator.service';
import { ImageToSketchResponse } from '../../interfaces/image-to-sketch.interface';
import { LoadingDialogComponent } from '../loading-dialog/loading-dialog.component';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';
import { environment } from '../../../enviroments/environments';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-camera',
  imports: [MatCardModule, MatButtonModule, MatIconModule, CommonModule],
  templateUrl: './camera.component.html',
  styleUrl: './camera.component.scss'
})
export class CameraComponent implements OnDestroy {
  @ViewChild('video', { static: false }) videoRef!: ElementRef<HTMLVideoElement>;
  stream: MediaStream | null = null;
  foto: string | null = null;

  public cameraOpen: boolean = false;
  constructor(
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<CameraComponent>,
    private generatorService: GeneratorService
  ) { }
  public ngOnDestroy(): void {
    this.cameraOpen = false;
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }
  async openCamera() {
    try {
      this.cameraOpen = true;
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });

      this.videoRef.nativeElement.srcObject = this.stream;

    } catch (err) {
      console.error("Error al abrir la cámara:", err);
    }
  }

  public takePhoto() {

    if (!this.videoRef) return;
    const dialogRef = this.dialog.open(LoadingDialogComponent, {
      disableClose: true,
      panelClass: 'custom-dialog',
    });

    const video = this.videoRef.nativeElement;
    const canvas = document.createElement('canvas');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (ctx) ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    this.foto = canvas.toDataURL("image/png");

    // Convertir a archivo
    const file = this.base64ToFile(this.foto, "captured.png");

    // Llamar al servicio
    this.generatorService.imageToSketch({ file }).subscribe({
      next: (resp: ImageToSketchResponse) => {
        dialogRef.close();
        this.dialogRef.close();
        console.log("Sketch recibido:", resp);

        // muestra el sketch generado
        // this.foto = resp.;
        const url = `${environment.apiUrl}/files/sketches/${resp.filenames[0]}`;
        this.generatorService.triggerCallbackLoadImage(url);
      },
      error: (error) => {
        console.error("Error al generar sketch", error);
        dialogRef.close();
        const dialogRefError = this.dialog.open(ErrorDialogComponent, {
          disableClose: true,
          data: { message: `Error al generar la imagen: ${error.message}` },
          panelClass: 'custom-dialog',
        });
      }
    });
  }

  public closeCamera() {
    this.cameraOpen = false;
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }

  private base64ToFile(base64: string, filename: string): File {
    const arr = base64.split(",");
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  }
}
