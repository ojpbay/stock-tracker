import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { DashboardStore } from './dashboard.store';
import { DashboardService, DashboardData } from '../services/dashboard.service';

const mockDashboard: DashboardData = {
  watchlistId: 'wl-1',
  watchlistName: 'Tech',
  holdings: [
    {
      holdingId: 'h-1',
      stockSymbol: 'AAPL',
      companyName: 'Apple Inc.',
      exchange: 'NASDAQ',
      totalUnits: 10,
      averagePurchasePrice: 150,
      lastPurchaseDate: '2026-01-01',
      currentPrice: 200,
      currentValue: 2000,
      unrealisedPnL: 500,
      unrealisedPnLPercent: 33.33,
      priceIsStale: false,
    },
  ],
  summary: {
    totalCost: 1500,
    totalCurrentValue: 2000,
    totalUnrealisedPnL: 500,
    totalUnrealisedPnLPercent: 33.33,
  },
};

describe('DashboardStore', () => {
  let store: InstanceType<typeof DashboardStore>;
  let serviceMock: jest.Mocked<DashboardService>;

  beforeEach(() => {
    serviceMock = {
      getDashboard: jest.fn(),
    } as unknown as jest.Mocked<DashboardService>;

    TestBed.configureTestingModule({
      providers: [
        DashboardStore,
        { provide: DashboardService, useValue: serviceMock },
      ],
    });

    store = TestBed.inject(DashboardStore);
  });

  it('should start with null dashboard data', () => {
    expect(store.dashboardData()).toBeNull();
    expect(store.loading()).toBe(false);
    expect(store.hasData()).toBe(false);
  });

  it('loadDashboard should populate holdings and summary', () => {
    serviceMock.getDashboard.mockReturnValue(of(mockDashboard));

    TestBed.runInInjectionContext(() => {
      store.loadDashboard('wl-1');
    });

    expect(store.holdings()).toHaveLength(1);
    expect(store.holdings()[0].stockSymbol).toBe('AAPL');
    expect(store.summary()?.totalUnrealisedPnL).toBe(500);
    expect(store.loading()).toBe(false);
    expect(store.hasData()).toBe(true);
  });

  it('loadDashboard should set error on failure', () => {
    serviceMock.getDashboard.mockReturnValue(throwError(() => new Error('API error')));

    TestBed.runInInjectionContext(() => {
      store.loadDashboard('wl-1');
    });

    expect(store.error()).toBe('API error');
    expect(store.holdings()).toEqual([]);
  });

  it('clearDashboard should reset state', () => {
    serviceMock.getDashboard.mockReturnValue(of(mockDashboard));
    TestBed.runInInjectionContext(() => {
      store.loadDashboard('wl-1');
    });

    store.clearDashboard();

    expect(store.dashboardData()).toBeNull();
    expect(store.hasData()).toBe(false);
  });

  it('watchlistName computed should return name from data', () => {
    serviceMock.getDashboard.mockReturnValue(of(mockDashboard));
    TestBed.runInInjectionContext(() => {
      store.loadDashboard('wl-1');
    });

    expect(store.watchlistName()).toBe('Tech');
  });
});
