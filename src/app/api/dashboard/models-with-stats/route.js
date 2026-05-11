import { NextResponse } from "next/server";
import { buildModelsList } from "@/app/api/v1/models/route";
import { getPricingForModel } from "@/shared/constants/pricing";
import { getUsageStats } from "@/lib/usageDb";

export const dynamic = "force-dynamic";

// ── Context window patterns (first match wins, tokens) ──
// Ordered from most-specific to most-general
const CONTEXT_PATTERNS = [
  // Gemini — 1M+
  { p: /gemini/i,                       ctx: 1048576 },

  // Claude — 200K
  { p: /claude/i,                        ctx: 200000  },

  // GPT-4.1 / GPT-5 series — 1M
  { p: /gpt-4\.1/i,                      ctx: 1000000 },
  { p: /gpt-5/i,                         ctx: 200000  },

  // GPT-4o — 128K
  { p: /gpt-4o/i,                        ctx: 128000  },

  // GPT-4 turbo — 128K
  { p: /gpt-4-turbo/i,                   ctx: 128000  },

  // GPT-4 base — 8K
  { p: /^gpt-4$/i,                       ctx: 8192    },

  // GPT-3.5 — 16K
  { p: /gpt-3\.5/i,                      ctx: 16385   },

  // o1 / o3 / o4 series — 200K
  { p: /^o[134]/i,                       ctx: 200000  },

  // Kimi / Moonshot — 128K
  { p: /kimi|moonshot/i,                 ctx: 131072  },

  // DeepSeek — 64K
  { p: /deepseek/i,                      ctx: 65536   },

  // Qwen3 235B — 131K
  { p: /qwen3-235b/i,                    ctx: 131072  },

  // Qwen general — 131K
  { p: /qwen/i,                          ctx: 131072  },

  // GLM — 128K
  { p: /glm/i,                           ctx: 128000  },

  // MiniMax — 1M
  { p: /minimax/i,                       ctx: 1000000 },

  // Grok — 131K
  { p: /grok/i,                          ctx: 131072  },

  // Mistral — 128K
  { p: /mistral|mixtral/i,               ctx: 131072  },

  // Llama 3.x — 128K
  { p: /llama-?3/i,                      ctx: 131072  },

  // Llama 2 — 4K
  { p: /llama-?2/i,                      ctx: 4096    },

  // Command R+ — 128K
  { p: /command-r/i,                     ctx: 131072  },

  // Cohere — 128K
  { p: /cohere|command/i,                ctx: 128000  },

  // Groq hosted — 32K
  { p: /groq/i,                          ctx: 32768   },

  // Perplexity — 127K
  { p: /pplx|sonar/i,                    ctx: 127072  },

  // Together / Fireworks — 32K default
  { p: /together|fireworks/i,            ctx: 32768   },

  // Vertex — 1M (Gemini-based)
  { p: /vertex|vx\//i,                   ctx: 1048576 },

  // OpenRouter passthrough — varies, show 200K as safe default
  { p: /openrouter/i,                    ctx: 200000  },
];

function inferContextWindow(modelId, provider) {
  const full = `${provider}/${modelId}`.toLowerCase();
  const base = modelId.toLowerCase();

  for (const { p, ctx } of CONTEXT_PATTERNS) {
    if (p.test(base) || p.test(full)) return ctx;
  }
  return null;
}

const ALL_KINDS = ["llm", "image", "embedding", "tts", "stt", "imageToText", "webSearch", "webFetch"];

export async function GET() {
  try {
    const [defaultModels, ...kindModels] = await Promise.all([
      buildModelsList(["llm"]),
      ...ALL_KINDS.map((k) => buildModelsList([k]).catch(() => [])),
    ]);

    const modelMap = new Map();
    for (const m of defaultModels) {
      modelMap.set(m.id, { ...m, _kind: m.owned_by === "combo" ? "combo" : "llm" });
    }
    for (let i = 0; i < ALL_KINDS.length; i++) {
      for (const m of kindModels[i]) {
        if (!modelMap.has(m.id)) {
          modelMap.set(m.id, { ...m, _kind: m.kind || ALL_KINDS[i] });
        }
      }
    }

    // Weekly token usage (7d)
    let usageByModel = {};
    try {
      const stats = await getUsageStats("7d");
      usageByModel = stats?.byModel || {};
    } catch { /* ignore */ }

    const models = Array.from(modelMap.values()).map((m) => {
      const provider = m.owned_by || "";
      const modelId = m.id.includes("/") ? m.id.split("/").pop() : m.id;

      // Pricing — try provider+model, then model alone
      const pricing =
        getPricingForModel(provider, modelId) ||
        getPricingForModel(null, modelId);

      // Context window — pattern inference
      const context = inferContextWindow(modelId, provider);

      // Weekly tokens — match usage records
      let weeklyTokens = null;
      for (const [key, data] of Object.entries(usageByModel)) {
        const raw = data?.rawModel || key;
        if (
          raw === modelId || raw === m.id ||
          key === m.id || key === modelId
        ) {
          weeklyTokens = (data.promptTokens || 0) + (data.completionTokens || 0);
          break;
        }
      }

      return {
        id: m.id,
        owned_by: provider,
        kind: m._kind,
        pricing: pricing ? { input: pricing.input, output: pricing.output } : null,
        context,
        weeklyTokens,
      };
    });

    return NextResponse.json({ models });
  } catch (error) {
    console.error("[models-with-stats]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
