import { NextResponse } from "next/server";
import { getSettings, updateSettings } from "@/lib/localDb";
import { pricingEmitter } from "@/lib/pricingEmitter";

const DEFAULT_PLANS = [
  {
    id: "free",
    name: "Free",
    price: "0",
    period: "forever",
    desc: "For developers getting started with AI.",
    highlight: false,
    cta: "Start for free",
    features: [
      "Access to 50+ free models",
      "10,000 requests / month",
      "OpenAI-compatible API",
      "Basic usage analytics",
      "Community support",
    ],
    rateLimit: {
      rpm: 10,
      rpd: 500,
      tpd: 100000,
    },
  },
  {
    id: "pro",
    name: "Pro",
    price: "20",
    period: "per month",
    desc: "For developers and teams building production apps.",
    highlight: true,
    cta: "Get started",
    features: [
      "Access to all 200+ models",
      "Unlimited requests",
      "Smart routing and fallback",
      "Advanced usage analytics",
      "Priority support",
      "Custom rate limits",
      "Team management",
    ],
    rateLimit: {
      rpm: 60,
      rpd: 5000,
      tpd: 2000000,
    },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    period: "contact us",
    desc: "For large teams with custom requirements.",
    highlight: false,
    cta: "Contact sales",
    features: [
      "Everything in Pro",
      "Dedicated infrastructure",
      "SLA guarantee",
      "Custom model integrations",
      "SSO and SAML",
      "Audit logs",
      "Dedicated support",
    ],
    rateLimit: {
      rpm: 0,
      rpd: 0,
      tpd: 0,
    },
  },
];

export async function GET() {
  try {
    const settings = await getSettings();
    return NextResponse.json({
      plans: settings.pricingPlans || DEFAULT_PLANS,
    });
  } catch (error) {
    console.error("[API] pricing GET error:", error);
    return NextResponse.json({ error: "Failed to fetch pricing" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    if (body.plans !== undefined) {
      await updateSettings({ pricingPlans: body.plans });
      // Notify all SSE listeners → landing page updates in real-time
      pricingEmitter.emit("update");
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] pricing PATCH error:", error);
    return NextResponse.json({ error: "Failed to update pricing" }, { status: 500 });
  }
}
