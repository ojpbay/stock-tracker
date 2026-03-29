import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface StockSearchResult {
  symbol: string;
  companyName: string;
  exchange: string;
  currency: string;
}

export interface StockQuote {
  symbol: string;
  companyName: string;
  exchange: string;
  currency: string;
  currentPrice: number;
  priceChange: number;
  priceChangePercent: number;
  marketCap: number;
  high52Week: number;
  low52Week: number;
  dataTimestamp: string;
}

interface SearchStocksResponse {
  results: StockSearchResult[];
}

@Injectable({ providedIn: 'root' })
export class StocksService {
  private readonly http = inject(HttpClient);

  search(query: string): Observable<StockSearchResult[]> {
    return new Observable((observer) => {
      this.http
        .get<SearchStocksResponse>(`/api/stocks/search`, {
          params: { q: query },
        })
        .subscribe({
          next: (response) => observer.next(response.results),
          error: (err) => observer.error(err),
          complete: () => observer.complete(),
        });
    });
  }

  getQuote(symbol: string): Observable<StockQuote> {
    return this.http.get<StockQuote>(`/api/stocks/${encodeURIComponent(symbol)}`);
  }
}
