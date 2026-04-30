import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap } from 'rxjs';
import { TriviaService, ToolCallSummary } from '../services/trivia.service';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: string[];
  timestamp: Date;
}

export interface TriviaState {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  score: number;
  questionsAnswered: number;
  correctAnswers: number;
  streak: number;
}

const initialState: TriviaState = {
  messages: [],
  loading: false,
  error: null,
  score: 0,
  questionsAnswered: 0,
  correctAnswers: 0,
  streak: 0,
};

function formatToolCall(tc: ToolCallSummary): string {
  try {
    const args = JSON.parse(tc.args);
    const argStr = Object.entries(args)
      .filter(([, v]) => v !== null && v !== undefined)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');
    return argStr ? `${tc.toolName}(${argStr})` : tc.toolName;
  } catch {
    return tc.toolName;
  }
}

function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export const TriviaStore = signalStore(
  withState(initialState),
  withComputed((store) => ({
    hasMessages: computed(() => store.messages().length > 0),
    accuracy: computed(() => {
      const answered = store.questionsAnswered();
      return answered > 0 ? Math.round((store.correctAnswers() / answered) * 100) : 0;
    }),
  })),
  withMethods((store, service = inject(TriviaService)) => ({
    sendMessage: rxMethod<string>(
      pipe(
        tap((content) => {
          // Add the user message immediately for a snappy feel
          patchState(store, {
            messages: [
              ...store.messages(),
              { id: newId(), role: 'user', content, timestamp: new Date() },
            ],
            loading: true,
            error: null,
          });
        }),
        switchMap((content) => {
          // Build history from all messages except the one we just appended
          const history = store
            .messages()
            .slice(0, -1)
            .map((m) => ({ role: m.role, content: m.content }));

          return service.sendMessage(content, history).pipe(
            tapResponse({
              next: (res) =>
                patchState(store, {
                  messages: [
                    ...store.messages(),
                    {
                      id: newId(),
                      role: 'assistant',
                      content: res.response,
                      toolCalls: res.toolCalls.map(formatToolCall),
                      timestamp: new Date(),
                    },
                  ],
                  loading: false,
                }),
              error: (err: Error) =>
                patchState(store, { error: err.message, loading: false }),
            }),
          );
        }),
      ),
    ),

    loadScore: rxMethod<void>(
      pipe(
        switchMap(() =>
          service.getScore().pipe(
            tapResponse({
              next: (s) =>
                patchState(store, {
                  score: s.score,
                  questionsAnswered: s.questionsAnswered,
                  correctAnswers: s.correctAnswers,
                  streak: s.streak,
                }),
              error: () => {},
            }),
          ),
        ),
      ),
    ),

    resetGame: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap(() =>
          service.resetGame().pipe(
            tapResponse({
              next: () => patchState(store, { ...initialState }),
              error: (err: Error) =>
                patchState(store, { error: err.message, loading: false }),
            }),
          ),
        ),
      ),
    ),
  })),
);
