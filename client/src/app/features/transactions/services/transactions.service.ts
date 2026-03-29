import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type TransactionType = 'Buy' | 'Sell' | 'Dividend';

export interface Transaction {
  transactionId: string;
  type: TransactionType;
  transactionDate: string;
  units: number | null;
  pricePerUnit: number | null;
  dividendAmount: number | null;
  createdAt: string;
}

export interface AddTransactionRequest {
  type: TransactionType;
  transactionDate: string;
  units: number | null;
  pricePerUnit: number | null;
  dividendAmount: number | null;
}

export interface AddTransactionResult {
  transactionId: string;
  holdingId: string;
  type: string;
  transactionDate: string;
  units: number | null;
  pricePerUnit: number | null;
  dividendAmount: number | null;
}

export interface ListTransactionsResponse {
  transactions: Transaction[];
}

@Injectable({ providedIn: 'root' })
export class TransactionsService {
  private readonly http = inject(HttpClient);

  list(watchlistId: string, holdingId: string, type?: string): Observable<Transaction[]> {
    const params: Record<string, string> = {};
    if (type) params['type'] = type;

    return new Observable((observer) => {
      this.http
        .get<ListTransactionsResponse>(
          `/api/watchlists/${encodeURIComponent(watchlistId)}/holdings/${encodeURIComponent(holdingId)}/transactions`,
          { params },
        )
        .subscribe({
          next: (res) => observer.next(res.transactions),
          error: (err) => observer.error(err),
          complete: () => observer.complete(),
        });
    });
  }

  add(
    watchlistId: string,
    holdingId: string,
    request: AddTransactionRequest,
  ): Observable<AddTransactionResult> {
    return this.http.post<AddTransactionResult>(
      `/api/watchlists/${encodeURIComponent(watchlistId)}/holdings/${encodeURIComponent(holdingId)}/transactions`,
      request,
    );
  }
}
