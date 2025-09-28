import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test/',
        '**/*.d.ts',
        '**/*.config.*',
        'src/pages/**',
        'src/layouts/**',
        'src/components/**',
        'database/',
        'public/'
      ]
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
});
