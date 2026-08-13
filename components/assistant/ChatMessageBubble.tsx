// ─────────────────────────────────────────────────────────────
// src/components/assistant/ChatMessageBubble.tsx
// ─────────────────────────────────────────────────────────────

interface MessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  streaming?: boolean;
}

export default function ChatMessageBubble({ role, content, timestamp, streaming }: MessageProps) {
  if (role === "user") {
    return (
      <div className="flex flex-col items-end">
        <div className="bg-surface-3 text-text-primary text-sm rounded-2xl rounded-tr-md px-4 py-2.5 max-w-[85%]">
          {content}
        </div>
        {timestamp && <span className="text-[11px] text-text-muted mt-1">{timestamp}</span>}
      </div>
    );
  }

  return (
    <div className="flex gap-2.5">
      <span className="w-7 h-7 rounded-lg bg-brand-orange/15 border border-brand-orange/25 flex items-center justify-center flex-shrink-0 text-brand-orange text-xs mt-0.5">
        ✦
      </span>
      <div className="text-sm text-gray-200 leading-relaxed max-w-[90%]">
        {content}
        {streaming && <span className="inline-block w-1.5 h-3.5 bg-gray-400 ml-0.5 animate-pulse" />}
      </div>
    </div>
  );
}


