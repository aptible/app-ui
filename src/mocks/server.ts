import { handlers } from "./handlers";
// src/mocks/server.js
import { setupServer } from "msw/node";

// This configures a request mocking server with the given request handlers.
export const server = setupServer(...handlers);
