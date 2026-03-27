import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface WatchlistSummary {
  id: string;
  name: string;
  description: string;
  holdingCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface HoldingSummary {
  holdingId: string;
  stockSymbol: string;
  companyName: string;
  exchange: string;
  totalUnits: number;
  averagePurchasePrice: number;
  lastPurchaseDate: string;
  status: string;
}

export interface WatchlistDetail extends WatchlistSummary {
  holdings: HoldingSummary[];
}

export interface CreateWatchlistRequest {
  name: string;
  description: string;
}

export interface ListWatchlistsResponse {
  watchlists: WatchlistSummary[];
}

@Injectable({ providedIn: 'root' })
export class WatchlistsService {
  private readonly http = inject(HttpClient);

  list(): Observable<WatchlistSummary[]> {
    return new Observable((observer) => {
      this.http.get<ListWatchlistsResponse>('/api/watchlists').subscribe({
        next: (res) => observer.next(res.watchlists),
        error: (err) => observer.error(err),
        complete: () => observer.complete(),
      });
    });
  }

  get(id: string): Observable<WatchlistDetail> {
    return this.http.get<WatchlistDetail>(`/api/watchlists/${encodeURIComponent(id)}`);
  }

  create(request: CreateWatchlistRequest): Observable<WatchlistDetail> {
    return this.http.post<WatchlistDetail>('/api/watchlists', request);
  }

  update(id: string, request: CreateWatchlistRequest): Observable<WatchlistDetail> {
    return this.http.put<WatchlistDetail>(`/api/watchlists/${encodeURIComponent(id)}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`/api/watchlists/${encodeURIComponent(id)}`);
  }
}
