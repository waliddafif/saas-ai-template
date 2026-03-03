import { z } from "zod";

// ─── display_message ─────────────────────────────────────────────────────────
// Example UI tool: renders a styled message card in the chat interface.
// Add your own domain-specific tools following this pattern.

export const displayMessageArgs = z.object({
  title: z.string().describe("Titre du message"),
  content: z.string().describe("Contenu du message"),
  variant: z
    .enum(["info", "success", "warning", "error"])
    .default("info")
    .describe("Style visuel du message"),
});

export const displayMessageResult = z.object({
  rendered: z.boolean(),
});

export type DisplayMessageArgs = z.infer<typeof displayMessageArgs>;
export type DisplayMessageResult = z.infer<typeof displayMessageResult>;
