import { Elysia } from "elysia";

export const sseRoute = new Elysia().get("/api/sse", async () => {
  // Placeholder: will use LISTEN/NOTIFY for real-time updates
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      controller.enqueue(encoder.encode("data: {\"type\":\"connected\"}\n\n"));

      // Keep-alive ping every 30s
      const interval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": ping\n\n"));
        } catch {
          clearInterval(interval);
        }
      }, 30_000);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
});
