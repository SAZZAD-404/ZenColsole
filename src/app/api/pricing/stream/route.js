import { NextResponse } from "next/server";
import { getSettings } from "@/lib/localDb";
import { pricingEmitter } from "@/lib/pricingEmitter";

export const dynamic = "force-dynamic";

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;
      let keepalive = null;

      const send = async () => {
        if (closed) return;
        try {
          const settings = await getSettings();
          const plans = settings.pricingPlans || null;
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ plans })}\n\n`)
          );
        } catch {
          closed = true;
          cleanup();
        }
      };

      const cleanup = () => {
        closed = true;
        pricingEmitter.off("update", send);
        if (keepalive) clearInterval(keepalive);
      };

      // Send immediately on connect
      await send();

      // Listen for updates from PATCH
      pricingEmitter.on("update", send);

      // Keepalive ping every 25s
      keepalive = setInterval(() => {
        if (closed) { clearInterval(keepalive); return; }
        try {
          controller.enqueue(encoder.encode(": ping\n\n"));
        } catch {
          cleanup();
        }
      }, 25000);

      // Store cleanup on controller for cancel()
      controller._cleanup = cleanup;
    },

    cancel(controller) {
      if (controller._cleanup) controller._cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type":  "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection":    "keep-alive",
    },
  });
}
