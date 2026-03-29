import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { StocksStore } from './stocks.store';
import { StocksService, StockSearchResult, StockQuote } from '../services/stocks.service';

const mockSearchResults: StockSearchResult[] = [
  { symbol: 'AAPL', companyName: 'Apple Inc.', exchange: 'NASDAQ', currency: 'USD' },
  { symbol: 'APLE', companyName: 'Apple Hospitality REIT', exchange: 'NYSE', currency: 'USD' },
];

const mockQuote: StockQuote = {
  symbol: 'AAPL',
  companyName: 'Apple Inc.',
  exchange: 'NASDAQ',
  currency: 'USD',
  currentPrice: 189.5,
  priceChange: 2.3,
  priceChangePercent: 1.23,
  marketCap: 2_950_000_000_000,
  high52Week: 199.62,
  low52Week: 164.08,
  dataTimestamp: new Date().toISOString(),
};

describe('StocksStore', () => {
  let store: InstanceType<typeof StocksStore>;
  let stocksServiceMock: jest.Mocked<StocksService>;

  beforeEach(() => {
    stocksServiceMock = {
      search: jest.fn(),
      getQuote: jest.fn(),
    } as unknown as jest.Mocked<StocksService>;

    TestBed.configureTestingModule({
      providers: [
        StocksStore,
        { provide: StocksService, useValue: stocksServiceMock },
      ],
    });

    store = TestBed.inject(StocksStore);
  });

  it('should have empty initial state', () => {
    expect(store.results()).toEqual([]);
    expect(store.selectedQuote()).toBeNull();
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('searchStocks should set loading then populate results on success', () => {
    stocksServiceMock.search.mockReturnValue(of(mockSearchResults));

    TestBed.runInInjectionContext(() => {
      store.searchStocks('Apple');
    });

    expect(store.results()).toEqual(mockSearchResults);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('searchStocks should set error signal on failure', () => {
    stocksServiceMock.search.mockReturnValue(throwError(() => new Error('Network error')));

    TestBed.runInInjectionContext(() => {
      store.searchStocks('Apple');
    });

    expect(store.error()).toBe('Network error');
    expect(store.loading()).toBe(false);
    expect(store.results()).toEqual([]);
  });

  it('loadQuote should populate selectedQuote on success', () => {
    stocksServiceMock.getQuote.mockReturnValue(of(mockQuote));

    TestBed.runInInjectionContext(() => {
      store.loadQuote('AAPL');
    });

    expect(store.selectedQuote()).toEqual(mockQuote);
    expect(store.loading()).toBe(false);
  });

  it('clearResults should reset state', () => {
    stocksServiceMock.search.mockReturnValue(of(mockSearchResults));
    TestBed.runInInjectionContext(() => {
      store.searchStocks('Apple');
    });

    store.clearResults();

    expect(store.results()).toEqual([]);
    expect(store.selectedQuote()).toBeNull();
    expect(store.error()).toBeNull();
  });

  it('hasResults computed should reflect results array', () => {
    expect(store.hasResults()).toBe(false);

    stocksServiceMock.search.mockReturnValue(of(mockSearchResults));
    TestBed.runInInjectionContext(() => {
      store.searchStocks('Apple');
    });

    expect(store.hasResults()).toBe(true);
  });
});
