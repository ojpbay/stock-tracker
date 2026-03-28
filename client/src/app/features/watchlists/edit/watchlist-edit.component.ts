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
    <h2 mat-dialog-title>Confirm Delete</h2>
    <mat-dialog-content>{{ data.message }}</mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="warn" [mat-dialog-close]="true" cdkFocusInitial>Delete</button>
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
      margin: 1rem auto;
      padding: 0 1rem;
    }
    .full-width { width: 100%; margin-bottom: 1rem; }
    .form-actions { display: flex; gap: 1rem; margin-top: 1rem; }
    .error-message { color: var(--mat-sys-error); }
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
