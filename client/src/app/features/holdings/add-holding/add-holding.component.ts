import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { HoldingsService } from '../services/holdings.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-add-holding',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  template: `
    <div class="add-container">
      <button mat-button (click)="goBack()">
        <mat-icon>arrow_back</mat-icon>
        Back
      </button>

      <h1>Add to Watchlist</h1>
      <p>Adding <strong>{{ symbol }}</strong> to this watchlist</p>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Number of units</mat-label>
          <input matInput type="number" formControlName="units" min="0.0001" step="0.0001" />
          @if (form.get('units')?.hasError('required')) {
            <mat-error>Units is required</mat-error>
          }
          @if (form.get('units')?.hasError('min')) {
            <mat-error>Units must be greater than zero</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Purchase price per unit</mat-label>
          <input matInput type="number" formControlName="pricePerUnit" min="0.0001" step="0.01" />
          @if (form.get('pricePerUnit')?.hasError('required')) {
            <mat-error>Price per unit is required</mat-error>
          }
          @if (form.get('pricePerUnit')?.hasError('min')) {
            <mat-error>Price must be greater than zero</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Purchase date</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="purchaseDate" [max]="today" />
          <mat-datepicker-toggle matIconSuffix [for]="picker" />
          <mat-datepicker #picker />
          @if (form.get('purchaseDate')?.hasError('required')) {
            <mat-error>Purchase date is required</mat-error>
          }
        </mat-form-field>

        <div class="form-actions">
          <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || submitting">
            Add to Watchlist
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .add-container {
      max-width: 480px;
      margin: 1rem auto;
      padding: 0 1rem;
    }
    .full-width { width: 100%; margin-bottom: 1rem; }
    .form-actions { margin-top: 1rem; }
  `],
})
export class AddHoldingComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly holdingsService = inject(HoldingsService);
  private readonly notification = inject(NotificationService);

  protected symbol = '';
  protected submitting = false;
  protected readonly today = new Date();

  private watchlistId = '';

  protected readonly form = this.fb.nonNullable.group({
    units: [0, [Validators.required, Validators.min(0.0001)]],
    pricePerUnit: [0, [Validators.required, Validators.min(0.0001)]],
    purchaseDate: [new Date(), Validators.required],
  });

  ngOnInit(): void {
    this.watchlistId = this.route.snapshot.paramMap.get('watchlistId') ?? '';
    this.symbol = this.route.snapshot.queryParamMap.get('symbol') ?? '';
  }

  protected onSubmit(): void {
    if (this.form.invalid || !this.watchlistId || !this.symbol) return;

    const { units, pricePerUnit, purchaseDate } = this.form.getRawValue();
    const dateStr = purchaseDate instanceof Date
      ? purchaseDate.toISOString().split('T')[0]
      : purchaseDate;

    this.submitting = true;
    this.holdingsService.addHolding(this.watchlistId, {
      stockSymbol: this.symbol,
      units,
      pricePerUnit,
      purchaseDate: dateStr,
    }).subscribe({
      next: () => {
        this.notification.showSuccess(`${this.symbol} added to watchlist`);
        this.router.navigate(['/watchlists', this.watchlistId]);
      },
      error: (err) => {
        this.notification.showError(err.message ?? 'Failed to add holding');
        this.submitting = false;
      },
    });
  }

  protected goBack(): void {
    history.back();
  }
}
