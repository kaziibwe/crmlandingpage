import type { Metadata } from "next";
import LegalComingSoonPage from "@/components/landing/LegalComingSoon";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "The terms and conditions for using EternityCrm. Full terms coming soon.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalComingSoonPage
      title="Terms & Conditions"
      description="The rules and guidelines for using EternityCrm. This document will cover accounts, billing, fair use, and more."
      path="/terms"
    />
  );
}
