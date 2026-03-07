import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDemoStore } from "@/lib/demoStore";

export function DemoBanner() {
  const isDemo = useDemoStore((s) => s.isDemo);
  const setDemo = useDemoStore((s) => s.setDemo);

  if (!isDemo) return null;

  return (
    <div className="flex items-center justify-center gap-3 bg-amber-50 px-4 py-2 text-sm text-amber-800 border-b border-amber-200">
      <span>
        <strong>Demo mode</strong> — Data is not persisted. Changes will be
        lost on refresh.
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="ml-auto h-6 w-6 shrink-0 text-amber-600 hover:text-amber-800 hover:bg-amber-100"
        onClick={() => setDemo(false)}
        aria-label="Dismiss demo banner"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
