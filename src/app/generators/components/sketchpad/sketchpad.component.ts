import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Output, ViewChild } from '@angular/core';
import { MenuDrawComponent } from '../menu-draw/menu-draw.component';
import { Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Pencil } from '../../../interfaces/pencil.interface';
import { brushTypes } from '../../../constants/pencils.constant';
import { GeneratorService } from '../../services/generator.service';
import { ImageToImageRequest, ImageToImageResponse } from '../../../interfaces/image-to-image.interfaces';

@Component({
  selector: 'app-sketchpad',
  imports: [MenuDrawComponent],
  templateUrl: './sketchpad.component.html',
  styleUrl: './sketchpad.component.scss'
})
export class SketchpadComponent implements AfterViewInit {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @Output()
  public imageUrlResult: EventEmitter<string> = new EventEmitter<string>();

  private ctx!: CanvasRenderingContext2D;
  private isDrawing = false;
  private lastX = 0;
  private lastY = 0;

  // Configuración del pincel
  brushColor = '#000000';
  brushSize = 5;
  brushTypes: Pencil[] = brushTypes;
  currentBrushType = this.brushTypes[0];

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private generatorService: GeneratorService) { }

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

  public generateImage(): void {
    const canvas = this.canvasRef.nativeElement;
    canvas.toBlob((blob: Blob | null) => {
      if (blob) {
        const file = new File([blob], 'drawing.png', { type: 'image/png' });
        const request: ImageToImageRequest = {
          file: file,
          prompt: 'anime style, high quality, detailed, hair with vibrant colors, masterpiece',
          filename: 'landscape.png',
          num_inference_steps: 50,
          strength: 0.75,
          guidance_scale: 9
        };
        this.generatorService.imageToImage(request).subscribe({
          next: (response: ImageToImageResponse) => {
            console.log('Imagen generada con éxito:', response);
            this.imageUrlResult.emit(this.generatorService.getImageUrl(response.filename!));
          },
          error: (error) => {
            console.error('Error al generar la imagen:', error);
          }
        });
      }
    });
  }
}
