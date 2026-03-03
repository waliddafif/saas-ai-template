import { Elysia } from "elysia";
import { type UIMessage, convertToModelMessages, tool } from "ai";
import { authGuard } from "../middleware/auth";
import { callLLM } from "../lib/ai";
import { z } from "zod";
import { displayMessageArgs } from "@saas-ai-template/shared/tools";

const SYSTEM_PROMPT = `Tu es un assistant IA intelligent et polyvalent.

Tu aides les utilisateurs à :
- Répondre à leurs questions
- Analyser des informations
- Afficher des messages structurés avec l'outil display_message

Règles :
- Réponds toujours en français
- Sois précis, concis et professionnel
- Utilise l'outil display_message pour afficher des informations importantes`;

export const chatRoute = new Elysia()
  .use(authGuard)
  .post("/api/chat", async ({ body }) => {
    const { messages } = body as { messages: UIMessage[] };

    const modelMessages = await convertToModelMessages(messages);

    const result = await callLLM({
      system: SYSTEM_PROMPT,
      messages: modelMessages,
      tools: {
        display_message: tool({
          description:
            "Affiche un message structuré avec un titre, un contenu et un style visuel. Utilise cet outil pour mettre en avant des informations importantes.",
          inputSchema: displayMessageArgs,
          outputSchema: z.object({ rendered: z.boolean() }),
          execute: async () => ({ rendered: true }),
        }),
      },
    });

    return result.toUIMessageStreamResponse();
  });
