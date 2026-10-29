import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
    reporters: 'default',
    // The suite is pure functions: no jsdom, no setup files, no network.
    clearMocks: true,
  },
});
