import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface HoldingDashboardRow {
  holdingId: string;
  stockSymbol: string;
  companyName: string;
  exchange: string;
  totalUnits: number;
  averagePurchasePrice: number;
  lastPurchaseDate: string;
  currentPrice: number | null;
  currentValue: number | null;
  unrealisedPnL: number | null;
  unrealisedPnLPercent: number | null;
  priceIsStale: boolean;
}

export interface DashboardSummary {
  totalCost: number;
  totalCurrentValue: number | null;
  totalUnrealisedPnL: number | null;
  totalUnrealisedPnLPercent: number | null;
}

export interface DashboardData {
  watchlistId: string;
  watchlistName: string;
  holdings: HoldingDashboardRow[];
  summary: DashboardSummary;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);

  getDashboard(watchlistId: string): Observable<DashboardData> {
    return this.http.get<DashboardData>(
      `/api/watchlists/${encodeURIComponent(watchlistId)}/dashboard`,
    );
  }
}
