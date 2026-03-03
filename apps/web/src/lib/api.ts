import { treaty } from "@elysiajs/eden";
import type { App } from "@saas-ai-template/api";

// Eden Treaty client — typed end-to-end from Elysia routes
export const api = treaty<App>(window.location.origin, {
  fetch: { credentials: "include" },
});
