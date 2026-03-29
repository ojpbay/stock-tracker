import { Component, input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  templateUrl: './loading-spinner.component.html',
  styles: [`
    .spinner-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
      gap: 16px;
    }
    .spinner-message {
      color: rgba(0, 0, 0, 0.54);
      margin: 0;
    }
  `]
})
export class LoadingSpinnerComponent {
  readonly diameter = input(48);
  readonly message = input('');
}
