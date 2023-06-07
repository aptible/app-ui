import { Request, Response, fetch } from "@remix-run/web-fetch";

// https://github.com/remix-run/react-router/issues/10375#issuecomment-1535303470
// https://github.com/vitest-dev/vitest/issues/3077#issuecomment-1484093141
if (!globalThis.fetch) {
  // Built-in lib.dom.d.ts expects `fetch(Request | string, ...)` but the web
  // fetch API allows a URL so @remix-run/web-fetch defines
  // `fetch(string | URL | Request, ...)`
  // @ts-expect-error
  globalThis.fetch = fetch;
  // Same as above, lib.dom.d.ts doesn't allow a URL to the Request constructor
  // @ts-expect-error
  globalThis.Request = Request;
  // web-std/fetch Response does not currently implement Response.error()
  // @ts-expect-error
  globalThis.Response = Response;
}

import { server } from "@app/mocks";
import matchers, {
  TestingLibraryMatchers,
} from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";
import { expect } from "vitest";

declare module "vitest" {
  interface JestAssertion<T = any>
    extends jest.Matchers<void, T>,
      TestingLibraryMatchers<T, void> {}
}

expect.extend(matchers);

// Establish API mocking before all tests.
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

beforeEach(() => {
  // https://github.com/testing-library/react-testing-library/issues/518#issuecomment-1423342825
  if (typeof window !== "undefined") {
    window.history.pushState({}, "", "/");
  }
});

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => {
  server.resetHandlers();
  // https://testing-library.com/docs/react-testing-library/api/#cleanup
  cleanup();
});

// Clean up after the tests are finished.
afterAll(() => server.close());
