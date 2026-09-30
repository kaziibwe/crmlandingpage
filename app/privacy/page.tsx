import type { Metadata } from "next";
import LegalComingSoonPage from "@/components/landing/LegalComingSoon";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How EternityCrm collects, uses, and protects your personal data. Full privacy policy coming soon.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalComingSoonPage
      title="Privacy Policy"
      description="We take your privacy seriously. This policy will explain what data we collect, how we use it, and the choices you have."
      path="/privacy"
    />
  );
}
