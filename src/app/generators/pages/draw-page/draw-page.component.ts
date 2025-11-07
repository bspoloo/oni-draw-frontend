import { Component, ElementRef, ViewChild } from '@angular/core';
import { MenuDrawComponent } from "../../components/menu-draw/menu-draw.component";
import { SketchpadComponent } from '../../components/sketchpad/sketchpad.component';
import { ResultPadComponent } from '../../components/result-pad/result-pad.component';
import { FormParamsComponent } from '../../components/form-params/form-params.component';
import { Hyperparam } from '../../../interfaces/hyperparam.interface';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { GeneratorService } from '../../services/generator.service';

@Component({
  selector: 'app-draw-page',
  imports: [SketchpadComponent, MatIconModule, MatButtonModule],
  templateUrl: './draw-page.component.html',
  styleUrl: './draw-page.component.scss'
})
export class DrawPageComponent {
  @ViewChild('image_result', { static: true }) imageResultRef!: ElementRef<HTMLImageElement>;

  public imageUrl: string = 'icons/chibi.gif';
  public hyperparamsGenerate: Hyperparam;
  public hyperparamsImprove: Hyperparam;
  public filenames: string[] = [];
  private currentImage: number = 0;

  constructor(private generatorService: GeneratorService) {
    this.hyperparamsGenerate = null as unknown as Hyperparam;
    this.hyperparamsImprove = null as unknown as Hyperparam;
  }

  public showGeneratedImage(imageUrls: string[]): void {
    this.imageUrl = this.generatorService.getImageUrl(imageUrls[0]);
    this.filenames = imageUrls;
  }

  public nextImage(): void {
    if (this.currentImage >= this.filenames.length - 1) {
      this.currentImage = 0;
    } else {
      this.currentImage++;
    }
    this.imageUrl = this.generatorService.getImageUrl(this.filenames[this.currentImage]);
  }

  public backImage(): void {
    if (this.currentImage <= 0) {
      this.currentImage = this.filenames.length - 1;
    } else {
      this.currentImage--;
    }
    this.imageUrl = this.generatorService.getImageUrl(this.filenames[this.currentImage]);
  }
}
