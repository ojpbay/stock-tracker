import { AfterViewInit, Component, OnDestroy, QueryList, ViewChildren, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatColumnDef, MatTable, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PnlIndicatorComponent } from '../../../shared/components/pnl-indicator/pnl-indicator.component';

@Component({
  selector: 'app-holding-row',
  standalone: true,
  imports: [MatTableModule, MatIconModule, MatTooltipModule, DecimalPipe, PnlIndicatorComponent],
  templateUrl: './holding-row.component.html',
  styles: [`
    .symbol-cell strong {
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--text-primary);
      font-family: 'Inter', monospace;
    }

    .symbol-cell small {
      display: block;
      font-size: 0.72rem;
      color: var(--text-muted);
      margin-top: 1px;
    }

    .num-cell {
      font-variant-numeric: tabular-nums;
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .stale-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
      color: var(--positive);
      vertical-align: middle;
      margin-left: 3px;
    }

    .unavailable {
      color: var(--text-muted);
      font-style: italic;
      font-size: 0.8rem;
    }
  `],
})
export class HoldingRowComponent implements AfterViewInit, OnDestroy {
  @ViewChildren(MatColumnDef) columnDefs!: QueryList<MatColumnDef>;
  private readonly table = inject(MatTable, { optional: true }) as MatTable<unknown> | null;

  ngAfterViewInit(): void {
    this.columnDefs.forEach(col => this.table?.addColumnDef(col));
    // Re-render the table because ngAfterContentInit (which does initial render) runs
    // before this component's view children (the column defs) are available.
    this.table?.renderRows();
  }

  ngOnDestroy(): void {
    this.columnDefs?.forEach(col => this.table?.removeColumnDef(col));
  }
}
