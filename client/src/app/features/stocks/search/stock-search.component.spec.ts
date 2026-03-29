import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { StockSearchComponent } from './stock-search.component';
import { StocksService } from '../services/stocks.service';

const mockResults = [
  { symbol: 'AAPL', companyName: 'Apple Inc.', exchange: 'NASDAQ', currency: 'USD' },
];

describe('StockSearchComponent', () => {
  let fixture: ComponentFixture<StockSearchComponent>;
  let component: StockSearchComponent;
  let stocksServiceMock: { search: jest.Mock; getQuote: jest.Mock };

  beforeEach(async () => {
    stocksServiceMock = {
      search: jest.fn().mockReturnValue(of([])),
      getQuote: jest.fn().mockReturnValue(of(null)),
    };

    await TestBed.configureTestingModule({
      imports: [StockSearchComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: StocksService, useValue: stocksServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StockSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should trigger search after debounce when user types', fakeAsync(() => {
    stocksServiceMock.search.mockReturnValue(of(mockResults));

    // Access the protected FormControl via type assertion
    const searchControl = (component as any).searchControl;
    searchControl.setValue('Apple');
    fixture.detectChanges();

    tick(400); // debounce
    fixture.detectChanges();

    expect(stocksServiceMock.search).toHaveBeenCalledWith('Apple');
  }));

  it('should render results in list after search', fakeAsync(() => {
    stocksServiceMock.search.mockReturnValue(of(mockResults));

    const searchControl = (component as any).searchControl;
    searchControl.setValue('Apple');
    fixture.detectChanges();

    tick(400);
    fixture.detectChanges();

    const listItems = fixture.nativeElement.querySelectorAll('mat-list-item');
    expect(listItems.length).toBeGreaterThanOrEqual(1);
  }));

  it('should not search for empty input', fakeAsync(() => {
    const searchControl = (component as any).searchControl;
    searchControl.setValue('');
    fixture.detectChanges();

    tick(400);

    expect(stocksServiceMock.search).not.toHaveBeenCalled();
  }));
});
