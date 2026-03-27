import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav #sidenav mode="side" [opened]="true" class="sidenav">
        <mat-nav-list>
          <a mat-list-item routerLink="/stocks/search" routerLinkActive="active-link">
            <mat-icon matListItemIcon>search</mat-icon>
            <span matListItemTitle>Stock Search</span>
          </a>
          <a mat-list-item routerLink="/watchlists" routerLinkActive="active-link">
            <mat-icon matListItemIcon>list</mat-icon>
            <span matListItemTitle>Watchlists</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary" class="toolbar">
          <button mat-icon-button (click)="sidenav.toggle()" aria-label="Toggle navigation">
            <mat-icon>menu</mat-icon>
          </button>
          <span class="app-title">Stock Tracker</span>
        </mat-toolbar>

        <main class="main-content">
          <router-outlet />
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container {
      height: 100vh;
    }
    .sidenav {
      width: 220px;
    }
    .toolbar {
      position: sticky;
      top: 0;
      z-index: 1;
    }
    .app-title {
      margin-left: 0.5rem;
      font-size: 1.2rem;
    }
    .main-content {
      padding: 1rem;
    }
    .active-link {
      background: var(--mat-sys-secondary-container);
    }
  `],
})
export class App {}
