import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';

// ng2-charts calls canvas.getContext() on init; jsdom doesn't implement it
beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = jest.fn();
});
import { DashboardComponent } from './dashboard.component';
import { DashboardStore } from './store/dashboard.store';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

const mockHolding = {
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
};

const mockSummary = {
  totalCost: 1500,
  totalCurrentValue: 2000,
  totalUnrealisedPnL: 500,
  totalUnrealisedPnLPercent: 33.33,
};

function makeStoreMock(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    loading: signal(false),
    error: signal<string | null>(null),
    hasData: signal(false),
    holdings: signal<typeof mockHolding[]>([]),
    summary: signal<typeof mockSummary | null>(null),
    watchlistName: signal(''),
    loadDashboard: jest.fn(),
    clearDashboard: jest.fn(),
    ...overrides,
  };
}

async function setup(
  watchlistId: string | null,
  storeMock: ReturnType<typeof makeStoreMock>,
) {
  await TestBed.configureTestingModule({
    imports: [DashboardComponent, NoopAnimationsModule],
    providers: [
      provideRouter([]),
      provideCharts(withDefaultRegisterables()),
      { provide: DashboardStore, useValue: storeMock },
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: { paramMap: convertToParamMap(watchlistId ? { watchlistId } : {}) },
        },
      },
    ],
  }).compileComponents();

  const fixture: ComponentFixture<DashboardComponent> = TestBed.createComponent(DashboardComponent);
  fixture.detectChanges();
  return fixture;
}

describe('DashboardComponent', () => {
  it('should create', async () => {
    const store = makeStoreMock();
    const fixture = await setup('wl-1', store);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should call loadDashboard with the watchlistId from route params', async () => {
    const store = makeStoreMock();
    await setup('wl-42', store);
    expect(store.loadDashboard).toHaveBeenCalledWith('wl-42');
  });

  it('should not call loadDashboard when watchlistId is absent', async () => {
    const store = makeStoreMock();
    await setup(null, store);
    expect(store.loadDashboard).not.toHaveBeenCalled();
  });

  it('should show loading spinner when store.loading is true', async () => {
    const store = makeStoreMock({ loading: signal(true) });
    const fixture = await setup('wl-1', store);
    const spinner = fixture.nativeElement.querySelector('mat-spinner');
    expect(spinner).not.toBeNull();
  });

  it('should hide loading spinner when not loading', async () => {
    const store = makeStoreMock({ loading: signal(false) });
    const fixture = await setup('wl-1', store);
    const spinner = fixture.nativeElement.querySelector('mat-spinner');
    expect(spinner).toBeNull();
  });

  it('should show error card when store.error is set', async () => {
    const store = makeStoreMock({ error: signal('Something went wrong') });
    const fixture = await setup('wl-1', store);
    const card = fixture.nativeElement.querySelector('mat-card.error-card');
    expect(card).not.toBeNull();
    expect(card.textContent).toContain('Something went wrong');
  });

  it('should display watchlist name in h1', async () => {
    const store = makeStoreMock({
      watchlistName: signal('Tech Portfolio'),
      hasData: signal(true),
    });
    const fixture = await setup('wl-1', store);
    const h1 = fixture.nativeElement.querySelector('h1');
    expect(h1?.textContent?.trim()).toBe('Tech Portfolio');
  });

  it('should show empty state when hasData is true but holdings is empty', async () => {
    const store = makeStoreMock({
      hasData: signal(true),
      holdings: signal([]),
      summary: signal(mockSummary),
    });
    const fixture = await setup('wl-1', store);
    const emptyState = fixture.nativeElement.querySelector('.empty-state');
    expect(emptyState).not.toBeNull();
    expect(emptyState.textContent).toContain('No holdings yet');
  });

  it('should render summary stats when data is available', async () => {
    // holdings kept empty so the MatTable is not rendered — cell-content tests live
    // in holding-row.component.spec.ts where the two-phase detectChanges pattern is used.
    const store = makeStoreMock({
      hasData: signal(true),
      holdings: signal([]),
      summary: signal(mockSummary),
    });
    const fixture = await setup('wl-1', store);
    const statLabels = fixture.nativeElement.querySelectorAll('.stat-label');
    const labelTexts = Array.from(statLabels).map((el: any) => el.textContent.trim());
    expect(labelTexts).toContain('Total Cost Basis');
    expect(labelTexts).toContain('Current Value');
  });
});
