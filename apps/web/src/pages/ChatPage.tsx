import { useMemo } from "react";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { DefaultChatTransport } from "ai";
import { Thread } from "@/components/assistant-ui/thread";

export function ChatPage() {
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        credentials: "include",
      }),
    []
  );

  const runtime = useChatRuntime({ transport });

  return (
    <div className="flex h-screen flex-col">
      <div className="flex items-center border-b px-6 py-3">
        <h1 className="text-lg font-semibold text-gray-900">Assistant IA</h1>
      </div>

      <AssistantRuntimeProvider runtime={runtime}>
        <div className="flex-1 overflow-hidden">
          <Thread />
        </div>
      </AssistantRuntimeProvider>
    </div>
  );
}
