import { Component, ElementRef, ViewChild } from '@angular/core';
import { MenuDrawComponent } from "../../components/menu-draw/menu-draw.component";
import { SketchpadComponent } from '../../components/sketchpad/sketchpad.component';
import { ResultPadComponent } from '../../components/result-pad/result-pad.component';

@Component({
  selector: 'app-draw-page',
  imports: [SketchpadComponent],
  templateUrl: './draw-page.component.html',
  styleUrl: './draw-page.component.scss'
})
export class DrawPageComponent {
  @ViewChild('image_result', { static: true }) imageResultRef!: ElementRef<HTMLImageElement>;

  public imageUrl: string = 'icons/chibi.gif';

  public showGeneratedImage(imageUrl: string) : void {
    console.log('Resultado generado', imageUrl);
    this.imageResultRef.nativeElement.src = imageUrl;
  }
}
