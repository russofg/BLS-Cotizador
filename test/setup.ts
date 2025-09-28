/**
 * Setup file for tests
 * Configures global test environment and mocks
 */

import { vi } from 'vitest';

// Mock Firebase modules to avoid actual Firebase calls during tests
vi.mock('../src/utils/firebase', () => ({
  db: {},
  auth: {}
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
global.testUtils = {
  createMockDate: (year: number, month: number, day: number) => new Date(year, month - 1, day),
  createMockTimestamp: (date: Date) => ({
    seconds: Math.floor(date.getTime() / 1000),
    toDate: () => date
  })
};
