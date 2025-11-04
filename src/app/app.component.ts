import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuDrawComponent } from './generators/components/menu-draw/menu-draw.component';
import { HeaderComponent } from "./components/header/header.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'onidraw-frontend';
}
