import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { MenuDrawComponent } from '../menu-draw/menu-draw.component';
import { Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Pencil } from '../../../interfaces/pencil.interface';
import { brushTypes } from '../../../constants/pencils.constant';
import { GeneratorService } from '../../services/generator.service';
import { ImageToImageRequest, ImageToImageResponse } from '../../../interfaces/image-to-image.interfaces';
import { FormParamsComponent } from '../form-params/form-params.component';
import { Hyperparam } from '../../../interfaces/hyperparam.interface';
import { MatDialog } from '@angular/material/dialog';
import { LoadingDialogComponent } from '../../../components/loading-dialog/loading-dialog.component';
import { ErrorDialogComponent } from '../../../components/error-dialog/error-dialog.component';
import { TextToImageRequest, TextToImageResponse } from '../../../interfaces/text-to-image.interfaces';

@Component({
  selector: 'app-sketchpad',
  imports: [MenuDrawComponent, FormParamsComponent],
  templateUrl: './sketchpad.component.html',
  styleUrl: './sketchpad.component.scss'
})
export class SketchpadComponent implements AfterViewInit {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @Output()
  public imageUrlResult: EventEmitter<string[]> = new EventEmitter<string[]>();

  private ctx!: CanvasRenderingContext2D;
  private isDrawing = false;
  private lastX = 0;
  private lastY = 0;

  brushColor = '#000000';
  brushSize = 5;
  brushTypes: Pencil[] = brushTypes;
  currentBrushType = this.brushTypes[0];

  @Input()
  public hyperparams?: Hyperparam;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private generatorService: GeneratorService,
    private dialog: MatDialog
  ) { }

  public ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeCanvas();
    }
  }

  private initializeCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;

    this.ctx.lineJoin = 'round';
    this.ctx.lineCap = 'round';
    this.ctx.lineWidth = this.brushSize;
    this.ctx.strokeStyle = this.brushColor;

    // Limpiar canvas con fondo blanco
    this.clearCanvas();
  }

  public startDrawing(event: MouseEvent | TouchEvent): void {
    this.isDrawing = true;
    const coords = this.getCoordinates(event);
    [this.lastX, this.lastY] = [coords.x, coords.y];
  }

  public draw(event: MouseEvent | TouchEvent): void {
    if (!this.isDrawing) return;

    event.preventDefault();
    const coords = this.getCoordinates(event);

    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(coords.x, coords.y);
    this.ctx.stroke();

    [this.lastX, this.lastY] = [coords.x, coords.y];
  }

  public stopDrawing(): void {
    this.isDrawing = false;
  }

  private getCoordinates(event: MouseEvent | TouchEvent): { x: number, y: number } {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();

    if (event instanceof MouseEvent) {
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
    } else {
      // Para eventos táctiles
      return {
        x: event.touches[0].clientX - rect.left,
        y: event.touches[0].clientY - rect.top
      };
    }
  }

  public changeToDeleteMode(): void {
    this.ctx.globalCompositeOperation = 'destination-out';
  }

  public clearCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);
    this.ctx.fillStyle = this.brushColor;
  }

  public changeColor(color: string): void {
    this.brushColor = color;
    this.ctx.strokeStyle = color;
  }

  public changeSize(size: number): void {
    this.brushSize = size;
    this.ctx.lineWidth = size;
  }
  @HostListener('window:resize')
  public onResize(): void {
    this.clearCanvas();
  }

  public changeBrushType(brushType: Pencil): void {
    this.currentBrushType = brushType;
    this.ctx.globalCompositeOperation = 'source-over';
    this.updateCanvasBrush();
    console.log('Pincel cambiado a:', brushType.name);
  }

  private updateCanvasBrush(): void {
    if (this.ctx) {
      this.ctx.lineCap = this.currentBrushType.lineCap;
      this.ctx.lineJoin = this.currentBrushType.lineJoin;
      this.applyBrushEffect(this.currentBrushType.id);
    }
  }

  private applyBrushEffect(brushId: string): void {
    switch (brushId) {
      case 'spray':
        // Para efecto spray podrías implementar puntos aleatorios
        this.ctx.globalAlpha = 0.7;
        break;
      case 'calligraphy':
        // Para caligrafía, línea más delgada y variable
        this.ctx.lineWidth = Math.max(1, this.brushSize / 2);
        break;
      default:
        this.ctx.globalAlpha = 1.0;
        this.ctx.lineWidth = this.brushSize;
    }
  }

  public generateImage(hyperparams: Hyperparam): void {

    const dialogRef = this.dialog.open(LoadingDialogComponent, {
      disableClose: true,
      panelClass: 'custom-dialog',
    });

    this.generatorService.textToImage(hyperparams as TextToImageRequest).subscribe({
      next: (response: TextToImageResponse) => {
        dialogRef.close();
        console.log('Imagen generada con éxito:', response);
        this.imageUrlResult.emit(response.filenames);
      },
      error: (error) => {
        console.error('Error al generar la imagen:', error);
        dialogRef.close();
        const dialogRefError = this.dialog.open(ErrorDialogComponent, {
          disableClose: true,
          data: { message: `Error al generar la imagen: ${error.message}` },
          panelClass: 'custom-dialog',
        });
      }
    });
  }
  public improveImage(hyperparams: Hyperparam): void {

    const dialogRef = this.dialog.open(LoadingDialogComponent, {
      disableClose: true,
      panelClass: 'custom-dialog',
    });

    const canvas = this.canvasRef.nativeElement;
    canvas.toBlob((blob: Blob | null) => {
      if (blob) {
        const file = new File([blob], 'drawing.png', { type: 'image/png' });
        const request: ImageToImageRequest = {
          file: file,
          prompt: hyperparams.prompt,
          num_images_per_prompt: hyperparams.num_images_per_prompt,
          filename: 'canvas_image.png',
          num_inference_steps: hyperparams.num_inference_steps,
          strength: hyperparams.strength,
          guidance_scale: hyperparams.guidance_scale,
        };
        this.generatorService.imageToImage(request).subscribe({
          next: (response: ImageToImageResponse) => {
            console.log('Imagen generada con éxito:', response);
            dialogRef.close();
            this.imageUrlResult.emit(response.filenames);
          },
          error: (error) => {
            console.error('Error al generar la imagen:', error);
            dialogRef.close();
            const dialogRefError = this.dialog.open(ErrorDialogComponent, {
              disableClose: true,
              data: { message: `Error al generar la imagen: ${error.message}` },
              panelClass: 'custom-dialog',
            });
          }
        });
      }
    });
  }
}
