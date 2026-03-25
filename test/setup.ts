/**
 * Setup file for tests
 * Configures global test environment and mocks
 */

import { vi, beforeEach } from 'vitest';
import { cache } from '../src/utils/cache';

// Mock Firebase modules to avoid actual Firebase calls during tests
vi.mock('../src/utils/firebase', () => ({
  db: {},
  auth: {}
}));

// Minimal Firebase Admin Mock for initialization
vi.mock('firebase-admin', () => ({
  apps: [{ name: '[DEFAULT]' }],
  initializeApp: vi.fn(),
  credential: {
    cert: vi.fn()
  },
  firestore: () => ({
    settings: vi.fn(),
    collection: vi.fn().mockReturnThis(),
    doc: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    get: vi.fn().mockResolvedValue({ docs: [], exists: false }),
  })
}));

// Mock the adminDb export
vi.mock('../src/utils/firebaseAdmin', () => ({
  adminDb: {
    collection: vi.fn().mockReturnThis(),
    doc: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    get: vi.fn().mockResolvedValue({ docs: [], exists: false }),
    add: vi.fn().mockResolvedValue({ id: 'mock-id', get: vi.fn() })
  }
}));

// Mock console methods to reduce noise in test output
global.console = {
  ...console,
  // Uncomment to suppress console.log during tests
  // log: vi.fn(),
  // warn: vi.fn(),
  // error: vi.fn(),
};

// Global test utilities
declare global {
  var testUtils: {
    createMockDate: (year: number, month: number, day: number) => Date;
    createMockTimestamp: (date: Date) => { seconds: number; toDate: () => Date };
  };
}

global.testUtils = {
  createMockDate: (year: number, month: number, day: number) => new Date(year, month - 1, day),
  createMockTimestamp: (date: Date) => ({
    seconds: Math.floor(date.getTime() / 1000),
    toDate: () => date
  })
};

// Reset cache before each test to ensure isolation
beforeEach(() => {
  cache.clear();
});
