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

        <!-- Logo / Brand -->
        <div class="sidenav-brand">
          <div class="brand-icon">
            <mat-icon>trending_up</mat-icon>
          </div>
          <div class="brand-text">
            <span class="brand-name">StockTracker</span>
            <span class="brand-sub">PRO</span>
          </div>
        </div>

        <div class="nav-section-label">MARKETS</div>
        <mat-nav-list>
          <a mat-list-item routerLink="/stocks" routerLinkActive="active-link">
            <mat-icon matListItemIcon>search</mat-icon>
            <span matListItemTitle>Stock Search</span>
          </a>
          <a mat-list-item routerLink="/watchlists" routerLinkActive="active-link">
            <mat-icon matListItemIcon>bookmark</mat-icon>
            <span matListItemTitle>Watchlists</span>
          </a>
        </mat-nav-list>

        <div class="sidenav-footer">
          <div class="market-status">
            <span class="status-dot"></span>
            <span class="status-text">Markets Open</span>
          </div>
        </div>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar class="toolbar">
          <button mat-icon-button (click)="sidenav.toggle()" aria-label="Toggle navigation" class="menu-btn">
            <mat-icon>menu</mat-icon>
          </button>
          <div class="toolbar-spacer"></div>
          <div class="toolbar-right">
            <span class="live-badge">
              <span class="live-dot"></span>
              LIVE
            </span>
          </div>
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
      background: var(--bg-primary);
    }

    /* ── Sidenav ──────────────────────────────────── */
    .sidenav {
      width: 230px;
      background: var(--bg-void) !important;
      border-right: 1px solid var(--border-subtle) !important;
      display: flex;
      flex-direction: column;
    }

    /* Brand */
    .sidenav-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 20px 16px 16px;
      border-bottom: 1px solid var(--border-subtle);
      margin-bottom: 8px;
    }

    .brand-icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: linear-gradient(135deg, var(--accent), #0088AA);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 12px var(--accent-glow);
      flex-shrink: 0;
    }

    .brand-icon mat-icon {
      color: #000;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .brand-text {
      display: flex;
      flex-direction: column;
    }

    .brand-name {
      font-family: 'Inter', sans-serif;
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.01em;
      line-height: 1.2;
    }

    .brand-sub {
      font-family: 'Inter', sans-serif;
      font-size: 0.6rem;
      font-weight: 700;
      letter-spacing: 0.15em;
      color: var(--accent);
    }

    /* Nav section label */
    .nav-section-label {
      font-family: 'Inter', sans-serif;
      font-size: 0.62rem;
      font-weight: 600;
      letter-spacing: 0.12em;
      color: var(--text-muted);
      padding: 4px 24px 4px;
      margin-top: 4px;
    }

    /* Nav items */
    mat-nav-list {
      padding: 0 8px !important;
    }

    .active-link {
      background: var(--accent-dim) !important;
      border: 1px solid var(--border-accent) !important;
      border-radius: var(--radius-md) !important;
    }

    .active-link mat-icon {
      color: var(--accent) !important;
    }

    /* Footer */
    .sidenav-footer {
      margin-top: auto;
      padding: 16px;
      border-top: 1px solid var(--border-subtle);
    }

    .market-status {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--positive);
      box-shadow: 0 0 8px var(--positive);
      animation: pulse-dot 2s ease-in-out infinite;
    }

    @keyframes pulse-dot {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }

    .status-text {
      font-size: 0.72rem;
      font-weight: 500;
      color: var(--text-muted);
      letter-spacing: 0.05em;
    }

    /* ── Toolbar ──────────────────────────────────── */
    .toolbar {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(6, 10, 20, 0.85) !important;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border-subtle);
      height: 52px !important;
      min-height: 52px !important;
    }

    .menu-btn {
      color: var(--text-secondary) !important;
    }

    .toolbar-spacer { flex: 1; }

    .toolbar-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .live-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 3px 10px;
      border-radius: 20px;
      background: rgba(255, 183, 0, 0.08);
      border: 1px solid var(--positive-border);
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      color: var(--positive);
    }

    .live-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--positive);
      box-shadow: 0 0 6px var(--positive);
      animation: pulse-dot 1.5s ease-in-out infinite;
    }

    /* ── Main Content ─────────────────────────────── */
    .main-content {
      padding: 1.5rem;
      min-height: calc(100vh - 52px);
    }
  `],
})
export class App {}
