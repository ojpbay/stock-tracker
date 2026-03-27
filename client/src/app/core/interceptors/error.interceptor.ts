import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notifications = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let message = 'An unexpected error occurred.';

      if (error.status === 0) {
        message = 'Could not reach the server. Please check your connection.';
      } else if (error.status === 400) {
        message = error.error?.error ?? 'Invalid request.';
      } else if (error.status === 404) {
        message = error.error?.error ?? 'The requested resource was not found.';
      } else if (error.status >= 500) {
        message = 'A server error occurred. Please try again later.';
      }

      notifications.showError(message);
      return throwError(() => error);
    })
  );
};
