import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { HoldingsStore } from './holdings.store';
import { WatchlistsService, HoldingSummary, WatchlistDetail } from '../../watchlists/services/watchlists.service';

const mockHoldings: HoldingSummary[] = [
  {
    holdingId: 'h-1',
    stockSymbol: 'AAPL',
    companyName: 'Apple Inc.',
    exchange: 'NASDAQ',
    totalUnits: 10,
    averagePurchasePrice: 150,
    lastPurchaseDate: '2026-01-01',
    status: 'Active',
  },
];

const mockWatchlistDetail: WatchlistDetail = {
  id: 'wl-1',
  name: 'Tech',
  description: '',
  holdingCount: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  holdings: mockHoldings,
};

describe('HoldingsStore', () => {
  let store: InstanceType<typeof HoldingsStore>;
  let serviceMock: jest.Mocked<WatchlistsService>;

  beforeEach(() => {
    serviceMock = {
      list: jest.fn(),
      get: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<WatchlistsService>;

    TestBed.configureTestingModule({
      providers: [
        HoldingsStore,
        { provide: WatchlistsService, useValue: serviceMock },
      ],
    });

    store = TestBed.inject(HoldingsStore);
  });

  it('should start with empty entities', () => {
    expect(store.allHoldings()).toEqual([]);
    expect(store.loading()).toBe(false);
  });

  it('loadHoldings should populate entities from watchlist', () => {
    serviceMock.get.mockReturnValue(of(mockWatchlistDetail));

    TestBed.runInInjectionContext(() => {
      store.loadHoldings('wl-1');
    });

    expect(store.allHoldings()).toHaveLength(1);
    expect(store.allHoldings()[0].stockSymbol).toBe('AAPL');
    expect(store.loading()).toBe(false);
  });

  it('addHolding should append to entities', () => {
    const newHolding: HoldingSummary = {
      holdingId: 'h-2',
      stockSymbol: 'MSFT',
      companyName: 'Microsoft',
      exchange: 'NASDAQ',
      totalUnits: 5,
      averagePurchasePrice: 300,
      lastPurchaseDate: '2026-02-01',
      status: 'Active',
    };

    store.addHolding(newHolding);

    expect(store.allHoldings()).toHaveLength(1);
    expect(store.allHoldings()[0].stockSymbol).toBe('MSFT');
  });

  it('updateHolding should patch existing entity', () => {
    store.addHolding(mockHoldings[0]);

    const updated: HoldingSummary = { ...mockHoldings[0], totalUnits: 15 };
    store.updateHolding(updated);

    expect(store.allHoldings()[0].totalUnits).toBe(15);
  });
});
