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

const PRIMARY_MODEL: LanguageModel = openai("gpt-4o-mini");
const FALLBACK_MODEL: LanguageModel = anthropic("claude-3-5-haiku-latest");

type StreamTextReturn = ReturnType<typeof streamText>;

export async function callLLM(params: {
  system?: string;
  messages: ModelMessage[];
  tools?: ToolSet;
  model?: LanguageModel;
  stopWhen?: StopCondition<ToolSet>;
}): Promise<Awaited<StreamTextReturn>> {
  const { model = PRIMARY_MODEL, stopWhen = stepCountIs(3), ...rest } = params;

  try {
    return await streamText({ model, stopWhen, ...rest });
  } catch (error) {
    console.error("Primary LLM failed, falling back:", error);
    return await streamText({ model: FALLBACK_MODEL, stopWhen, ...rest });
  }
}

export { PRIMARY_MODEL, FALLBACK_MODEL };
