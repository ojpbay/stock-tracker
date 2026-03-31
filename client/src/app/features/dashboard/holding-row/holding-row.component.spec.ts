import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatTableModule } from '@angular/material/table';
import { HoldingRowComponent } from './holding-row.component';
import { HoldingDashboardRow } from '../services/dashboard.service';

const COLUMNS = ['symbol', 'units', 'avgPrice', 'currentPrice', 'currentValue', 'pnl'];

const mockHolding: HoldingDashboardRow = {
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

// Host component that owns the MatTable so HoldingRowComponent can inject it.
@Component({
  standalone: true,
  imports: [MatTableModule, HoldingRowComponent],
  template: `
    <table mat-table [dataSource]="rows">
      <app-holding-row />
      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
    </table>
  `,
})
class TestHostComponent {
  rows: HoldingDashboardRow[] = [];
  displayedColumns: string[] = [];
}

/**
 * Two-phase setup required by the addColumnDef pattern:
 *  1st detectChanges — table renders with no columns/data so no header-render error fires;
 *                      HoldingRowComponent.ngAfterViewInit runs and registers column defs.
 *  2nd detectChanges — now that column defs are registered, set real data and re-render.
 */
async function setup(rows: HoldingDashboardRow[]): Promise<ComponentFixture<TestHostComponent>> {
  await TestBed.configureTestingModule({
    imports: [TestHostComponent, NoopAnimationsModule],
  }).compileComponents();

  const fixture = TestBed.createComponent(TestHostComponent);
  fixture.detectChanges(); // phase 1: registers column defs via ngAfterViewInit

  fixture.componentInstance.displayedColumns = COLUMNS;
  fixture.componentInstance.rows = rows;
  fixture.detectChanges(); // phase 2: table renders with registered columns + real data

  return fixture;
}

describe('HoldingRowComponent', () => {
  it('should render symbol and company name', async () => {
    const fixture = await setup([mockHolding]);
    expect(fixture.nativeElement.textContent).toContain('AAPL');
    expect(fixture.nativeElement.textContent).toContain('Apple Inc.');
  });

  it('should render formatted units and average price', async () => {
    const fixture = await setup([mockHolding]);
    expect(fixture.nativeElement.textContent).toContain('10');
    expect(fixture.nativeElement.textContent).toContain('150.00');
  });

  it('should render current price when available', async () => {
    const fixture = await setup([mockHolding]);
    expect(fixture.nativeElement.textContent).toContain('200.00');
  });

  it('should show N/A when currentPrice is null', async () => {
    const holding = { ...mockHolding, currentPrice: null, currentValue: null, unrealisedPnL: null };
    const fixture = await setup([holding as HoldingDashboardRow]);
    expect(fixture.nativeElement.textContent).toContain('N/A');
  });

  it('should show em-dash when currentValue is null', async () => {
    const holding = { ...mockHolding, currentPrice: null, currentValue: null, unrealisedPnL: null };
    const fixture = await setup([holding as HoldingDashboardRow]);
    expect(fixture.nativeElement.textContent).toContain('—');
  });

  it('should render pnl-indicator when unrealisedPnL is available', async () => {
    const fixture = await setup([mockHolding]);
    const indicator = fixture.nativeElement.querySelector('app-pnl-indicator');
    expect(indicator).not.toBeNull();
  });

  it('should show em-dash instead of pnl-indicator when unrealisedPnL is null', async () => {
    const holding = { ...mockHolding, currentPrice: null, currentValue: null, unrealisedPnL: null };
    const fixture = await setup([holding as HoldingDashboardRow]);
    expect(fixture.nativeElement.querySelector('app-pnl-indicator')).toBeNull();
  });
});
