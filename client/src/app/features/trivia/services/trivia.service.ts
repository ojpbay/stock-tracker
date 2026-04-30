import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ToolCallSummary {
  toolName: string;
  args: string;
}

export interface ChatResponse {
  response: string;
  toolCalls: ToolCallSummary[];
}

export interface ScoreData {
  score: number;
  questionsAnswered: number;
  correctAnswers: number;
  streak: number;
}

@Injectable({ providedIn: 'root' })
export class TriviaService {
  private readonly http = inject(HttpClient);

  sendMessage(
    message: string,
    conversationHistory: Array<{ role: string; content: string }>,
  ): Observable<ChatResponse> {
    return this.http.post<ChatResponse>('/trivia-api/chat', {
      message,
      conversationHistory,
    });
  }

  getScore(): Observable<ScoreData> {
    return this.http.get<ScoreData>('/trivia-api/score');
  }

  resetGame(): Observable<void> {
    return this.http.post<void>('/trivia-api/reset', {});
  }
}
