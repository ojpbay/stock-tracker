import { Component, OnInit, inject, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { WatchlistsStore } from '../store/watchlists.store';
import { WatchlistsService } from '../services/watchlists.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule],
  template: `
    <div style="padding: 8px 4px 0">
      <h2 mat-dialog-title style="font-family: Inter, sans-serif; font-weight: 700; color: var(--text-primary); font-size: 1.1rem; letter-spacing: -0.01em;">Confirm Delete</h2>
    </div>
    <mat-dialog-content style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.6; padding-top: 8px;">{{ data.message }}</mat-dialog-content>
    <mat-dialog-actions align="end" style="padding: 12px 24px 20px; gap: 8px;">
      <button mat-button mat-dialog-close style="color: var(--text-secondary); font-family: Inter, sans-serif;">Cancel</button>
      <button mat-raised-button [mat-dialog-close]="true" cdkFocusInitial
        style="background: var(--negative) !important; color: #fff !important; font-family: Inter, sans-serif; font-weight: 600; border-radius: 8px;">
        Delete
      </button>
    </mat-dialog-actions>
  `,

})
export class ConfirmDialogComponent {
  protected readonly data = inject<{ message: string }>(MAT_DIALOG_DATA);
}

@Component({
  selector: 'app-watchlist-edit',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
  ],
  providers: [WatchlistsStore],
  templateUrl: './watchlist-edit.component.html',
  styles: [`
    .edit-container {
      max-width: 560px;
      margin: 0 auto;
    }

    .back-btn {
      color: var(--text-secondary) !important;
      font-size: 0.8rem !important;
      margin-bottom: 1.5rem;
    }

    .page-eyebrow {
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--accent);
      margin-bottom: 4px;
    }

    .page-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.03em;
      margin-bottom: 1.75rem;
    }

    .form-card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-xl);
      padding: 28px;
    }

    .full-width {
      width: 100%;
      margin-bottom: 0.5rem;
    }

    .form-actions {
      display: flex;
      gap: 10px;
      margin-top: 1.25rem;
      align-items: center;
    }

    .save-btn {
      background: linear-gradient(135deg, var(--accent), #0099CC) !important;
      color: #000 !important;
      font-weight: 700 !important;
      letter-spacing: 0.02em !important;
      border-radius: var(--radius-md) !important;
      box-shadow: 0 0 16px var(--accent-glow) !important;
      height: 42px !important;
      padding: 0 24px !important;
    }

    .delete-btn {
      color: var(--negative) !important;
      border-color: var(--negative-border) !important;
      border-radius: var(--radius-md) !important;
      height: 42px !important;
    }

    .delete-btn:hover {
      background: var(--negative-dim) !important;
    }

    .error-message {
      color: var(--negative);
      background: var(--negative-dim);
      border: 1px solid var(--negative-border);
      border-radius: var(--radius-md);
      padding: 10px 14px;
      font-size: 0.875rem;
      margin-top: 1rem;
    }
  `],
})
export class WatchlistEditComponent implements OnInit {
  protected readonly store = inject(WatchlistsStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly watchlistsService = inject(WatchlistsService);
  private readonly dialog = inject(MatDialog);

  protected isNew = true;
  private watchlistId: string | null = null;

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isNew = false;
      this.watchlistId = id;
      this.watchlistsService.get(id).subscribe((wl) => {
        this.form.patchValue({ name: wl.name, description: wl.description });
      });
    }
  }

  protected onSubmit(): void {
    if (this.form.invalid) return;
    const { name, description } = this.form.getRawValue();

    if (this.isNew) {
      this.store.createWatchlist({ name, description });
      this.router.navigate(['/watchlists']);
    } else if (this.watchlistId) {
      this.store.updateWatchlist({ id: this.watchlistId, name, description });
      this.router.navigate(['/watchlists', this.watchlistId]);
    }
  }

  protected confirmDelete(): void {
    if (!this.watchlistId) return;
    const watchlistId = this.watchlistId;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '360px',
      data: { message: 'Are you sure you want to delete this watchlist? This will also remove all associated holdings and transactions.' },
    });
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.store.deleteWatchlist(watchlistId);
        this.router.navigate(['/watchlists']);
      }
    });
  }

  protected goBack(): void {
    this.router.navigate(['/watchlists']);
  }
}
