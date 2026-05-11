import Navigation from "./components/Navigation";
import HeroSection from "./components/HeroSection";
import FeaturesSection from "./components/FeaturesSection";
import ModelsSection from "./components/ModelsSection";
import HowItWorksSection from "./components/HowItWorksSection";
import CodeExamplesSection from "./components/CodeExamplesSection";
import ComparisonSection from "./components/ComparisonSection";
import SecuritySection from "./components/SecuritySection";
import PricingSection from "./components/PricingSection";
import FAQSection from "./components/FAQSection";
import CTASection from "./components/CTASection";
import Footer from "./components/Footer";

export const metadata = {
  title: "ZenConsole — The Unified API for Every LLM",
  description:
    "One API key. 400+ models. 60+ providers. Better prices, better uptime, no subscriptions. The OpenAI-compatible gateway for production AI.",
};

export default function LandingPage() {
  return (
    <div style={{ background: "#0A0A0C" }}>
      <Navigation />
      <main>
        <HeroSection />
        <FeaturesSection />
        <ModelsSection />
        <HowItWorksSection />
        <CodeExamplesSection />
        <ComparisonSection />
        <SecuritySection />
        <PricingSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
