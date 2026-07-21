import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    // jsdom gives us window/sessionStorage/MessageEvent for the
    // pure-but-DOM-adjacent functions we test (isCalendlyEvent,
    // buildCalendlyUrl + readPrefill).
    environment: 'jsdom',
    // Match files like `*.test.ts` next to source.
    include: ['**/*.test.ts'],
  },
  resolve: {
    alias: {
      // Mirror tsconfig's `@/*` path alias so imports work in tests.
      '@': path.resolve(__dirname, '.'),
    },
  },
});
