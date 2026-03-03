import { Elysia, status } from "elysia";
import { auth } from "../lib/auth";

export const authGuard = new Elysia({ name: "auth-guard" }).derive(
  { as: "scoped" },
  async ({ request }) => {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session) {
      throw status(401, "Unauthorized");
    }
    return { user: session.user, session: session.session };
  }
);
