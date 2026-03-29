import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { WatchlistsStore } from './watchlists.store';
import { WatchlistsService, WatchlistSummary } from '../services/watchlists.service';

const mockWatchlists: WatchlistSummary[] = [
  {
    id: '1',
    name: 'Tech Stocks',
    description: 'My tech picks',
    holdingCount: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Dividends',
    description: '',
    holdingCount: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

describe('WatchlistsStore', () => {
  let store: InstanceType<typeof WatchlistsStore>;
  let serviceMock: jest.Mocked<WatchlistsService>;

  beforeEach(() => {
    serviceMock = {
      list: jest.fn(),
      get: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<WatchlistsService>;

    TestBed.configureTestingModule({
      providers: [
        WatchlistsStore,
        { provide: WatchlistsService, useValue: serviceMock },
      ],
    });

    store = TestBed.inject(WatchlistsStore);
  });

  it('should start with empty state', () => {
    expect(store.watchlists()).toEqual([]);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
    expect(store.selectedId()).toBeNull();
  });

  it('loadWatchlists should populate watchlists', () => {
    serviceMock.list.mockReturnValue(of(mockWatchlists));

    TestBed.runInInjectionContext(() => {
      store.loadWatchlists();
    });

    expect(store.watchlists()).toEqual(mockWatchlists);
    expect(store.loading()).toBe(false);
    expect(store.isEmpty()).toBe(false);
  });

  it('createWatchlist should append to watchlists list', () => {
    serviceMock.list.mockReturnValue(of([mockWatchlists[0]]));
    const newWatchlist = { ...mockWatchlists[1] };
    serviceMock.create.mockReturnValue(of(newWatchlist as any));

    TestBed.runInInjectionContext(() => {
      store.loadWatchlists();
      store.createWatchlist({ name: 'Dividends', description: '' });
    });

    expect(store.watchlists()).toHaveLength(2);
    expect(store.watchlists()[1].name).toBe('Dividends');
  });

  it('updateWatchlist should patch matching watchlist in place', () => {
    serviceMock.list.mockReturnValue(of(mockWatchlists));
    const updatedName = 'Updated Tech';
    serviceMock.update.mockReturnValue(of({ ...mockWatchlists[0], name: updatedName } as any));

    TestBed.runInInjectionContext(() => {
      store.loadWatchlists();
      store.updateWatchlist({ id: '1', name: updatedName, description: '' });
    });

    expect(store.watchlists()[0].name).toBe(updatedName);
  });

  it('selectWatchlist should set selectedId', () => {
    store.selectWatchlist('2');
    expect(store.selectedId()).toBe('2');
  });
});
