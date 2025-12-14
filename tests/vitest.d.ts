/// <reference types="vitest/globals" />

// Vitest global type declarations
// This file ensures TypeScript recognizes Vitest globals (describe, it, expect, vi, etc.)

import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";

declare global {
  namespace Vi {
    interface JestAssertion<T = unknown>
      extends jest.Matchers<void, T>,
        TestingLibraryMatchers<T, void> {}
  }
}

export {};
