import { Component, Input, OnInit } from '@angular/core';
import { ImageToImageResponse } from '../../../interfaces/image-to-image.interfaces';

@Component({
  selector: 'app-result-pad',
  imports: [],
  templateUrl: './result-pad.component.html',
  styleUrl: './result-pad.component.scss'
})
export class ResultPadComponent implements OnInit {
  @Input()
  public imageUrl?: string;

  public ngOnInit(): void {
    console.log(this.imageUrl);
  }
}
