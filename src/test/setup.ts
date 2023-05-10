import { server } from "@app/mocks";
import matchers, {
  TestingLibraryMatchers,
} from "@testing-library/jest-dom/matchers";
import { expect } from "vitest";

declare module "vitest" {
  interface JestAssertion<T = any>
    extends jest.Matchers<void, T>,
      TestingLibraryMatchers<T, void> {}
}

expect.extend(matchers);

// Establish API mocking before all tests.
beforeAll(() => server.listen());

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished.
afterAll(() => server.close());
