import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    // jsdom gives us window/sessionStorage for DOM-adjacent tests.
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
