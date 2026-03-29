import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HoldingSummary } from '../../watchlists/services/watchlists.service';

export interface AddHoldingRequest {
  stockSymbol: string;
  units: number;
  pricePerUnit: number;
  purchaseDate: string; // ISO date string 'YYYY-MM-DD'
}

export interface AddHoldingResult {
  watchlistId: string;
  holding: HoldingSummary;
}

@Injectable({ providedIn: 'root' })
export class HoldingsService {
  private readonly http = inject(HttpClient);

  addHolding(watchlistId: string, request: AddHoldingRequest): Observable<AddHoldingResult> {
    return this.http.post<AddHoldingResult>(
      `/api/watchlists/${encodeURIComponent(watchlistId)}/holdings`,
      request,
    );
  }
}
