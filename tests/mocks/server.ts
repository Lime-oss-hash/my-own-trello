import { setupServer } from "msw/node";
import { handlers } from "./handlers";

// Setup MSW server for Node.js environment (unit/integration tests)
export const server = setupServer(...handlers);
