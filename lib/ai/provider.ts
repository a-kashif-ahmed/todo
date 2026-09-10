// ─────────────────────────────────────────────────────────────
// lib/ai/provider.ts
// A single provider class driven entirely by user-entered config —
// endpoint URL, "shape" (which request/response format it speaks), model
// name, and API key. No hardcoded provider list: OpenRouter, OpenAI,
// Google AI Studio, a self-hosted vLLM/LM Studio/Ollama box, or anything
// else that speaks OpenAI-compatible chat completions all work by typing
// in the right endpoint — see the "Supported endpoints" doc you're writing
// for users for the exact URLs to paste in.
//
// Only two request/response shapes exist today: "openai" (OpenAI,
// OpenRouter, Google AI Studio's OpenAI-compat endpoint, and virtually
// every self-hosted OpenAI-compatible server) and "anthropic" (Claude's
// native Messages API, which uses a different auth header and response
// body). Pick whichever matches the endpoint you're pointing at.
// ─────────────────────────────────────────────────────────────

export type ProviderShape = "openai" | "anthropic";

export interface ProviderConfig {
  endpoint: string;   // full URL, e.g. https://openrouter.ai/api/v1/chat/completions
  shape: ProviderShape;
  model: string;
  apiKey: string;     // may be "" for endpoints that don't require auth (local servers)
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface CompleteOptions {
  maxTokens?: number;
  timeoutMs?: number;
}

function authHeaders(config: ProviderConfig): Record<string, string> {
  if (!config.apiKey) return {};
  return config.shape === "anthropic"
    ? { "x-api-key": config.apiKey, "anthropic-version": "2023-06-01" }
    : { Authorization: `Bearer ${config.apiKey}` };
}

function buildBody(config: ProviderConfig, messages: ChatMessage[], maxTokens: number, stream: boolean) {
  if (config.shape === "anthropic") {
    const system = messages.find(m => m.role === "system")?.content;
    return {
      model: config.model,
      max_tokens: maxTokens,
      stream,
      messages: messages.filter(m => m.role !== "system"),
      ...(system ? { system } : {}),
    };
  }
  return { model: config.model, max_tokens: maxTokens, stream, messages };
}

export class AIProvider {
  constructor(private config: ProviderConfig) {}

  get model() {
    return this.config.model;
  }

  async complete(prompt: string, options: CompleteOptions = {}): Promise<string> {
    return this.chat([{ role: "user", content: prompt }], options);
  }

  async chat(messages: ChatMessage[], options: CompleteOptions = {}): Promise<string> {
    const res = await fetch(this.config.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders(this.config) },
      body: JSON.stringify(buildBody(this.config, messages, options.maxTokens || 1000, false)),
      signal: AbortSignal.timeout(options.timeoutMs || 30000),
    });

    if (!res.ok) {
      throw new Error(`AI provider error (${res.status}): ${await res.text()}`);
    }

    const data = await res.json();
    return this.config.shape === "anthropic"
      ? data.content?.[0]?.text || ""
      : data.choices?.[0]?.message?.content || "";
  }

  // Yields plain text deltas as they arrive, regardless of which shape the
  // underlying endpoint speaks — callers never need to know the difference.
  async *streamChat(messages: ChatMessage[], options: CompleteOptions = {}): AsyncGenerator<string> {
    const res = await fetch(this.config.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders(this.config) },
      body: JSON.stringify(buildBody(this.config, messages, options.maxTokens || 1000, true)),
      signal: AbortSignal.timeout(options.timeoutMs || 60000),
    });

    if (!res.ok || !res.body) {
      throw new Error(`AI provider stream error (${res.status}): ${res.ok ? "no body" : await res.text()}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop() || ""; // keep the last partial line for next chunk

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const raw = line.slice(6).trim();
        if (raw === "[DONE]") return;

        try {
          const parsed = JSON.parse(raw);
          if (this.config.shape === "anthropic") {
            if (parsed.type === "content_block_delta" && parsed.delta?.text) {
              yield parsed.delta.text;
            }
          } else {
            const text = parsed.choices?.[0]?.delta?.content;
            if (text) yield text;
          }
        } catch {
          // partial/malformed chunk — skip it, next chunk usually completes it
        }
      }
    }
  }

  async healthCheck(): Promise<{ ok: boolean; latencyMs: number; error?: string }> {
    const start = Date.now();
    try {
      await this.complete("ping", { maxTokens: 5, timeoutMs: 8000 });
      return { ok: true, latencyMs: Date.now() - start };
    } catch (e: unknown) {
      return { ok: false, latencyMs: Date.now() - start, error: e instanceof Error ? e.message : String(e) };
    }
  }

  // Cheapest real round-trip that confirms endpoint + key + model actually
  // work together — used by Settings' "Test connection" before saving.
  async validateKey(): Promise<{ valid: boolean; error?: string }> {
    try {
      await this.complete("Respond with the single word: ok", { maxTokens: 5, timeoutMs: 10000 });
      return { valid: true };
    } catch (e: unknown) {
      return { valid: false, error: e instanceof Error ? e.message : String(e) };
    }
  }
}

export function createProvider(config: ProviderConfig): AIProvider {
  if (!config.endpoint) throw new Error("No AI provider endpoint configured.");
  if (!config.model) throw new Error("No AI model configured.");
  return new AIProvider(config);
}
