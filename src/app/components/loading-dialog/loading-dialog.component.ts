import { Component } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-loading-dialog',
  imports: [MatProgressSpinnerModule],
  templateUrl: './loading-dialog.component.html',
  styleUrl: './loading-dialog.component.scss'
})
export class LoadingDialogComponent {
  constructor(public dialogRef: MatDialogRef<LoadingDialogComponent>) {

  }
}
