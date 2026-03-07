import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import {
  streamText,
  stepCountIs,
  type ModelMessage,
  type LanguageModel,
  type ToolSet,
  type StopCondition,
} from "ai";
import { getLangfuse } from "./langfuse";

const PRIMARY_MODEL: LanguageModel = openai("gpt-4o-mini");
const FALLBACK_MODEL: LanguageModel = anthropic("claude-3-5-haiku-latest");

type StreamTextReturn = ReturnType<typeof streamText>;

// Cost rates in USD per 1M tokens
const MODEL_RATES: Record<string, { input: number; output: number }> = {
  "gpt-4o-mini": { input: 0.15, output: 0.6 },
  "gpt-4o": { input: 2.5, output: 10.0 },
  "claude-3-5-haiku-latest": { input: 0.8, output: 4.0 },
  "claude-3-5-sonnet-latest": { input: 3.0, output: 15.0 },
};

/** Estimate cost in USD for a given model and token counts. Returns 0 if model is unknown. */
export function computeCostUsd(
  modelId: string,
  inputTokens: number,
  outputTokens: number
): number {
  const rate = MODEL_RATES[modelId];
  if (!rate) return 0;
  return (inputTokens * rate.input + outputTokens * rate.output) / 1_000_000;
}

export async function callLLM(params: {
  system?: string;
  messages: ModelMessage[];
  tools?: ToolSet;
  model?: LanguageModel;
  stopWhen?: StopCondition<ToolSet>;
  traceMetadata?: { userId?: string; sessionId?: string };
}): Promise<Awaited<StreamTextReturn>> {
  const {
    model = PRIMARY_MODEL,
    stopWhen = stepCountIs(3),
    traceMetadata,
    ...rest
  } = params;

  // Langfuse tracing (optional — graceful degradation)
  const lf = getLangfuse();
  const trace = lf?.trace({
    name: "chat",
    userId: traceMetadata?.userId,
    sessionId: traceMetadata?.sessionId,
  });

  const startTime = Date.now();

  try {
    const result = await streamText({ model, stopWhen, ...rest });

    trace?.generation({
      name: "streamText",
      model: "gpt-4o-mini",
      startTime: new Date(startTime),
      endTime: new Date(),
    });

    return result;
  } catch (error) {
    trace?.generation({
      name: "streamText-fallback",
      model: "claude-3-5-haiku-latest",
      startTime: new Date(),
      metadata: { fallback: true },
    });

    console.error("Primary LLM failed, falling back:", error);
    return await streamText({ model: FALLBACK_MODEL, stopWhen, ...rest });
  }
}

export { PRIMARY_MODEL, FALLBACK_MODEL };
