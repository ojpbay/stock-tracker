import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { WatchlistEditComponent } from './watchlist-edit.component';
import { WatchlistsService } from '../services/watchlists.service';

describe('WatchlistEditComponent', () => {
  let fixture: ComponentFixture<WatchlistEditComponent>;
  let component: WatchlistEditComponent;
  let serviceMock: jest.Mocked<WatchlistsService>;

  beforeEach(async () => {
    serviceMock = {
      list: jest.fn().mockReturnValue(of([])),
      get: jest.fn().mockReturnValue(of(null)),
      create: jest.fn().mockReturnValue(of({})),
      update: jest.fn().mockReturnValue(of({})),
      delete: jest.fn().mockReturnValue(of(undefined)),
    } as unknown as jest.Mocked<WatchlistsService>;

    await TestBed.configureTestingModule({
      imports: [WatchlistEditComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: WatchlistsService, useValue: serviceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WatchlistEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show create mode heading for new watchlist', () => {
    const heading = fixture.nativeElement.querySelector('h1');
    expect(heading?.textContent).toContain('New Watchlist');
  });

  it('submit button should be disabled when name is empty', () => {
    const submitBtn = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(submitBtn?.disabled).toBe(true);
  });

  it('form should be valid when name is filled in', () => {
    const form = (component as any).form;
    form.get('name').setValue('Tech Stocks');
    fixture.detectChanges();

    expect(form.valid).toBe(true);
  });
});
