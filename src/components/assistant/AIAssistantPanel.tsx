// ─────────────────────────────────────────────────────────────
// src/components/assistant/AIAssistantPanel.tsx
// The full right-side chat panel
// ─────────────────────────────────────────────────────────────

"use client";
import { useState, useRef, useEffect } from "react";
import { X, Send, Paperclip, Mic, ArrowUp } from "lucide-react";
import ChatMessageBubble from "./ChatMessageBubble";
import AIRecommendationInline from "./AIRecommendationInline";
import AssistantActions from "./AssistantActions";

interface Message {
  role: "user" | "assistant";
  content: string;
  recommendation?: string;
  showActions?: boolean;
}

interface Props4 {
  workflowId: string;
  incidentContext?: string;
  onClose: () => void;
  onApplyFix?: () => void;
  onRestore?: () => void;
  onOpenCompare?: () => void;
}

export default function AIAssistantPanel({
  workflowId,
  incidentContext = "",
  onClose,
  onApplyFix,
  onRestore,
  onOpenCompare,
}: Props4) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [applyingFix, setApplyingFix] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function send() {
    if (!input.trim() || streaming) return;
    const userMsg: Message = { role: "user", content: input };
    const history = [...messages, userMsg];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setStreaming(true);

    const res = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: history.map(m => ({ role: m.role, content: m.content })),
        context: incidentContext,
      }),
    });

    if (!res.body) { setStreaming(false); return; }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let text = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const lines = decoder.decode(value).split("\n");
      for (const line of lines) {
        if (!line.startsWith("data: ") || line === "data: [DONE]") continue;
        try {
          const parsed = JSON.parse(line.slice(6));
          if (parsed.text) {
            text += parsed.text;
            setMessages(prev => [...prev.slice(0, -1), { role: "assistant", content: text }]);
          }
        } catch {}
      }
    }
    setStreaming(false);
  }

  async function handleApplyFix() {
    setApplyingFix(true);
    try { await onApplyFix?.(); } finally { setApplyingFix(false); }
  }

  async function handleRestore() {
    setRestoring(true);
    try { await onRestore?.(); } finally { setRestoring(false); }
  }

  return (
    <div className="fixed right-0 top-0 h-screen w-[480px] bg-surface-2 border-l border-border flex flex-col z-40">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border-light">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-lg bg-brand-blue/15 border border-brand-blue/25 flex items-center justify-center text-brand-blue">
            ◎
          </span>
          <div>
            <p className="text-sm font-semibold text-white">Flow Detective</p>
            <p className="text-[11px] text-status-success flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-status-success" />
              {streaming ? "Analyzing flow" : "Ready"}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 text-xs mt-12">
            Ask anything about this workflow.<br />
            Try "Why did this fail?"
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i}>
            <ChatMessageBubble
              role={m.role}
              content={m.content}
              streaming={streaming && i === messages.length - 1 && m.role === "assistant"}
            />
            {m.recommendation && <AIRecommendationInline text={m.recommendation} />}
            {m.showActions && (
              <AssistantActions
                onApplyFix={handleApplyFix}
                onRestore={handleRestore}
                onOpenCompare={() => onOpenCompare?.()}
                applyingFix={applyingFix}
                restoring={restoring}
              />
            )}
          </div>
        ))}
        {!streaming && messages.length > 0 && messages[messages.length - 1].role === "assistant" && (
          <p className="text-[11px] text-gray-600 -mt-2">
            Assistant · AI-Engine v1.0
          </p>
        )}
      </div>

      {/* Input */}
      <div className="px-5 py-4 border-t border-border-light">
        <div className="flex items-center gap-2 bg-surface border border-border rounded-xl px-4 py-2.5">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            placeholder="Ask FlowLens..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-500 outline-none"
          />
          <button onClick={send} disabled={streaming || !input.trim()} className="text-brand-blue disabled:opacity-40">
            <ArrowUp size={18} />
          </button>
        </div>
        <div className="flex items-center justify-between mt-2.5 px-1">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[11px] text-gray-500">
              <Paperclip size={11} /> Context
            </span>
            <span className="flex items-center gap-1 text-[11px] text-gray-500">
              <Mic size={11} /> Voice
            </span>
          </div>
          <span className="text-[11px] text-gray-600">Markdown supported</span>
        </div>
      </div>
    </div>
  );
}

