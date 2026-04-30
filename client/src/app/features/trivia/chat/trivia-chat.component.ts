import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TriviaStore } from '../store/trivia.store';

@Component({
  selector: 'app-trivia-chat',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  providers: [TriviaStore],
  templateUrl: './trivia-chat.component.html',
  styleUrl: './trivia-chat.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TriviaChatComponent implements OnInit, AfterViewChecked {
  protected readonly store = inject(TriviaStore);

  @ViewChild('messageList') private messageList!: ElementRef<HTMLElement>;

  protected inputText = '';
  private shouldScroll = false;

  ngOnInit(): void {
    this.store.loadScore(undefined);
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.messageList?.nativeElement.scrollTo({
        top: this.messageList.nativeElement.scrollHeight,
        behavior: 'smooth',
      });
      this.shouldScroll = false;
    }
  }

  protected send(): void {
    const text = this.inputText.trim();
    if (!text || this.store.loading()) return;
    this.inputText = '';
    this.shouldScroll = true;
    this.store.sendMessage(text);
  }

  protected onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  protected reset(): void {
    this.store.resetGame(undefined);
  }
}
