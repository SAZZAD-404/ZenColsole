"use client";
import { useRouter } from "next/navigation";

export default function PricingSection() {
  const router = useRouter();
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for testing and small projects",
      features: ["5,000 requests/month", "Access to 50+ models", "Basic rate limiting", "Community support", "API documentation"],
      cta: "Start free",
      highlighted: false,
    },
    {
      name: "Pro",
      price: "$29",
      period: "per month",
      description: "For growing teams and production apps",
      features: ["100,000 requests/month", "Access to all 195+ models", "Advanced rate limiting", "Priority support", "Custom routing rules", "Usage analytics", "Team collaboration"],
      cta: "Start Pro trial",
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact us",
      description: "For large-scale deployments",
      features: ["Unlimited requests", "Dedicated infrastructure", "SLA guarantees", "24/7 premium support", "Custom integrations", "Advanced security", "Dedicated account manager"],
      cta: "Contact sales",
      highlighted: false,
    },
  ];
  return (
    <section id="pricing" className="relative py-24 px-5" style={{ background: "#09090B" }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-black text-white mb-4" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.03em" }}>Simple, transparent pricing</h2>
          <p style={{ fontSize: "clamp(15px, 1.6vw, 17px)", color: "rgba(255,255,255,0.5)", maxWidth: 600, margin: "0 auto" }}>Start free, scale as you grow. No hidden fees, no surprises.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan, idx) => (
            <div key={idx} className="relative rounded-2xl p-8 transition-all duration-300" style={{ background: plan.highlighted ? "rgba(11,124,143,0.08)" : "rgba(255,255,255,0.03)", border: plan.highlighted ? "1px solid rgba(11,124,143,0.3)" : "1px solid rgba(255,255,255,0.08)", transform: plan.highlighted ? "scale(1.05)" : "scale(1)" }}>
              {plan.highlighted && (<div className="absolute -top-3 left-1/2 px-3 py-1 rounded-full text-xs font-semibold" style={{ transform: "translateX(-50%)", background: "#0B7C8F", color: "white" }}>Most popular</div>)}
              <div className="mb-6">
                <h3 className="font-bold text-white mb-2" style={{ fontSize: 20 }}>{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="font-black text-white" style={{ fontSize: 40 }}>{plan.price}</span>
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>{plan.period}</span>
                </div>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>{plan.description}</p>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2" style={{ fontSize: 14, color: "rgba(255,255,255,0.7)" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#0B7C8F", marginTop: 1 }}>check_circle</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button onClick={() => router.push("/dashboard")} className="w-full py-3 rounded-lg font-semibold transition-all duration-200" style={{ background: plan.highlighted ? "#0B7C8F" : "rgba(255,255,255,0.06)", color: plan.highlighted ? "white" : "rgba(255,255,255,0.7)", border: plan.highlighted ? "none" : "1px solid rgba(255,255,255,0.12)" }}>{plan.cta}</button>
            </div>
          ))}
        </div>
        <p className="text-center mt-12" style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>All plans include access to our API documentation and community support.<br />Need a custom plan? <a href="mailto:support@zenconsole.dev" className="underline" style={{ color: "#0B7C8F" }}>Contact us</a></p>
      </div>
    </section>
  );
}
