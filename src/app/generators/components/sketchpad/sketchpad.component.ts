import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, Output, viewChild, ViewChild, OnInit } from '@angular/core';
import { MenuDrawComponent } from '../menu-draw/menu-draw.component';
import { Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Pencil } from '../../../interfaces/pencil.interface';
import { brushTypes } from '../../../constants/pencils.constant';
import { GeneratorService } from '../../../services/generator.service';
import { ImageToImageRequest, ImageToImageResponse } from '../../../interfaces/image-to-image.interfaces';
import { FormParamsComponent } from '../form-params/form-params.component';
import { Hyperparam } from '../../../interfaces/hyperparam.interface';
import { MatDialog } from '@angular/material/dialog';
import { LoadingDialogComponent } from '../../../components/loading-dialog/loading-dialog.component';
import { ErrorDialogComponent } from '../../../components/error-dialog/error-dialog.component';
import { TextToImageRequest, TextToImageResponse } from '../../../interfaces/text-to-image.interfaces';
import { HyperparamsService } from '../../../services/hyperparams.service';

@Component({
  selector: 'app-sketchpad',
  imports: [MenuDrawComponent],
  templateUrl: './sketchpad.component.html',
  styleUrl: './sketchpad.component.scss'
})
export class SketchpadComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

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

  private currentImageData: ImageData | null = null;

  @Input()
  public hyperparams?: Hyperparam;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private generatorService: GeneratorService,
    private hyperparamsService: HyperparamsService,
    private dialog: MatDialog
  ) { }
  public ngOnInit(): void {
    this.generatorService.registerCallbackImproveImage(() => this.improveImage());
    this.generatorService.registerCallbackCanvasImage((file: File) => this.onFileSelected(file));
    this.generatorService.registerCallbackLoadImage((image: string) => this.loadImageFromUrl(image));
  }

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

  public improveImage(): void {

    const hyperparams: Hyperparam = this.hyperparamsService.getHyperparmas();
    console.log(hyperparams.model_name);

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
          filename: 'canvas_draw_image.png',
          num_inference_steps: hyperparams.num_inference_steps,
          strength: hyperparams.strength,
          guidance_scale: hyperparams.guidance_scale,
          model_name: hyperparams.model_name
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

  public loadImageFromUrl(url: string): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = this.ctx;

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
      const width = img.width * scale;
      const height = img.height * scale;
      const x = (canvas.width - width) / 2;
      const y = (canvas.height - height) / 2;

      ctx.drawImage(img, x, y, width, height);
    };

    img.onerror = (err: any) => {
      const dialogRefError = this.dialog.open(ErrorDialogComponent, {
        disableClose: true,
        data: { message: `Error al cargar la imagen: ${err.message}` },
        panelClass: 'custom-dialog',
      });
    };

    img.src = url;
  }

  public loadImageToCanvas(file: File): void {
    console.log(file);

    const canvas = this.canvasRef.nativeElement;
    const ctx = this.ctx;

    const reader = new FileReader();

    reader.onload = (e: any) => {
      const img = new Image();

      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const scale = Math.min(
          canvas.width / img.width,
          canvas.height / img.height
        );

        const width = img.width * scale;
        const heigth = img.height * scale;
        const x = (canvas.width - width) / 2;
        const y = (canvas.height - heigth) / 2;

        ctx.drawImage(img, x, y, width, heigth);
      };

      img.onerror = (error: any) => {
        const dialogRefError = this.dialog.open(ErrorDialogComponent, {
          disableClose: true,
          data: { message: `Error al generar la imagen: ${error.message}` },
          panelClass: 'custom-dialog',
        });
      }
      img.src = e.target.result;
    };

    reader.onerror = (error: any) => {
      const dialogRefError = this.dialog.open(ErrorDialogComponent, {
        disableClose: true,
        data: { message: `Error al generar la imagen: ${error.message}` },
        panelClass: 'custom-dialog',
      });
    }
    reader.readAsDataURL(file);
  }
  public openFilePicker(): void {
    this.fileInput.nativeElement.click();
  }

  public async onFileSelected(event: any): Promise<void> {
    const file: File = event.target.files[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      const dialogRefError = this.dialog.open(ErrorDialogComponent, {
        disableClose: true,
        data: { message: `Por favor, selecciona un archivo de imagen` },
        panelClass: 'custom-dialog',
      });
      return;
    }

    this.loadImageToCanvas(file);

    event.target.value = '';
  }

  public saveCurrentImageData(): void {
    const canvas = this.canvasRef.nativeElement;
    this.currentImageData = this.ctx.getImageData(0, 0, canvas.width, canvas.height);
  }
}
