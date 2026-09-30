import { SITE_URL, SITE_NAME, SEO_DESCRIPTION } from "@/lib/site";
import { FAQ_ITEMS } from "@/lib/faq";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Marquee from "@/components/landing/Marquee";
import Reveal from "@/components/landing/Reveal";
import AnchorNav from "@/components/landing/AnchorNav";
import StackDeck from "@/components/landing/StackDeck";
import DemoForm from "@/components/landing/DemoForm";
import {
  ProblemSolution,
  Channels,
  AiSection,
  Pipeline,
  Customer360,
  Automation,
  Security,
  FinalCta,
  Faq,
  Footer,
} from "@/components/landing/Sections";

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "EternityCrm",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: SITE_URL,
      description: SEO_DESCRIPTION,
      image: `${SITE_URL}/logo.png`,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD", description: "Free to explore" },
      featureList: [
        "AI-powered CRM for sales, customers and conversations",
        "Lead management and sales pipeline",
        "WhatsApp, email, SMS and calls in one workspace",
        "Sales automation and CRM automation",
        "AI sales assistant and AI customer support",
      ],
    },
    {
      "@type": "Organization",
      name: "EternityCrm",
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
      slogan: "Believe in endless connections",
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+256785557587",
        email: "alfredkaziibwe19@gmail.com",
        contactType: "customer service",
        availableLanguage: ["English"],
      },
    },
    {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
      publisher: { "@type": "Organization", name: "EternityCrm", url: SITE_URL },
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQ_ITEMS.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ],
};

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <Reveal />
      <AnchorNav />
      <StackDeck />
      <Navbar />
      <Hero />
      <Marquee />
      <div className="stack">
        <ProblemSolution />
        <Channels />
        <AiSection />
        <Pipeline />
        <Customer360 />
        <Automation />
        <Security />
        <Faq />
      </div>
      <DemoSection />
      <FinalCta />
      <Footer />
    </>
  );
}

function DemoSection() {
  return (
    <section id="demo" className="py-20 md:py-28 px-4 sm:px-6 bg-white dark:bg-slate-950/60 border-y border-slate-100 dark:border-slate-800/70 relative overflow-hidden">
      <div className="glow w-[420px] h-[420px] bg-blue-400/25 dark:bg-blue-600/20 bottom-[-140px] left-1/2 -translate-x-1/2"></div>
      <div className="max-w-2xl mx-auto relative">
        <div className="reveal text-center">
          <p className="eyebrow justify-center"><i className="fas fa-calendar-check"></i> Book a demo</p>
          <h2 className="text-3xl md:text-[42px] font-bold tracking-tight text-slate-900 dark:text-white leading-tight">See EternityCRM in action.</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-4 text-lg leading-relaxed">Tell us about your team and we'll tailor the walkthrough to your channels, pipeline and workflows.</p>
        </div>
        <DemoForm />
      </div>
    </section>
  );
}
