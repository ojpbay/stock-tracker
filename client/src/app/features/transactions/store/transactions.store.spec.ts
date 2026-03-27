import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { TransactionsStore } from './transactions.store';
import { TransactionsService, Transaction } from '../services/transactions.service';

const mockTransactions: Transaction[] = [
  {
    transactionId: 'tx-1',
    type: 'Buy',
    transactionDate: '2026-01-01',
    units: 10,
    pricePerUnit: 150,
    dividendAmount: null,
    createdAt: new Date().toISOString(),
  },
  {
    transactionId: 'tx-2',
    type: 'Dividend',
    transactionDate: '2026-02-01',
    units: null,
    pricePerUnit: null,
    dividendAmount: 12.5,
    createdAt: new Date().toISOString(),
  },
];

describe('TransactionsStore', () => {
  let store: InstanceType<typeof TransactionsStore>;
  let serviceMock: jest.Mocked<TransactionsService>;

  beforeEach(() => {
    serviceMock = {
      list: jest.fn(),
      add: jest.fn(),
    } as unknown as jest.Mocked<TransactionsService>;

    TestBed.configureTestingModule({
      providers: [
        TransactionsStore,
        { provide: TransactionsService, useValue: serviceMock },
      ],
    });

    store = TestBed.inject(TransactionsStore);
  });

  it('should start with empty entities', () => {
    expect(store.allTransactions()).toEqual([]);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('loadTransactions should populate entities', () => {
    serviceMock.list.mockReturnValue(of(mockTransactions));

    TestBed.runInInjectionContext(() => {
      store.loadTransactions({ watchlistId: 'wl-1', holdingId: 'h-1' });
    });

    expect(store.allTransactions()).toHaveLength(2);
    expect(store.transactionCount()).toBe(2);
    expect(store.loading()).toBe(false);
  });

  it('loadTransactions should set error on failure', () => {
    serviceMock.list.mockReturnValue(throwError(() => new Error('Load failed')));

    TestBed.runInInjectionContext(() => {
      store.loadTransactions({ watchlistId: 'wl-1', holdingId: 'h-1' });
    });

    expect(store.error()).toBe('Load failed');
  });

  it('computed selectors should filter by type', () => {
    serviceMock.list.mockReturnValue(of(mockTransactions));

    TestBed.runInInjectionContext(() => {
      store.loadTransactions({ watchlistId: 'wl-1', holdingId: 'h-1' });
    });

    expect(store.buyTransactions()).toHaveLength(1);
    expect(store.dividendTransactions()).toHaveLength(1);
    expect(store.sellTransactions()).toHaveLength(0);
  });
});
