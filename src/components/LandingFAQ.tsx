// Only questions answerable from facts already established elsewhere
// (CLAUDE.md's Phase 1 payment policy and Core Product Loop) are included
// here. Deliberately NOT included: Bar Council compliance status and how
// pickers are vetted — those are legal/policy claims that need the firm's
// sign-off before going out on a public, indexed page. Add them here once
// real, approved copy exists.
const FAQS: { question: string; answer: string }[] = [
  {
    question: "How much does it cost to use Law Kaki?",
    answer:
      "Nothing right now — no listing fees, no success fees. The commission for a picked-up job is settled directly between lawyers, the same way it already happens informally.",
  },
  {
    question: "How does signing delegation actually work?",
    answer:
      "A lawyer posts a signing they can't make — venue, time, document type, and an indicative fee. Nearby lawyers get notified and can pick it up. Once confirmed, both sides see each other's contact, reminders go out before the appointment, and the original lawyer rates the job once it's done.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: f.answer },
  })),
};

export default function LandingFAQ() {
  return (
    <section style={{ width: "100%", marginTop: 40 }}>
      <h2
        style={{
          fontSize: 20, fontWeight: 700, letterSpacing: "-0.015em",
          textAlign: "center", marginTop: 0, marginBottom: 16, lineHeight: 1.25,
        }}
      >
        Frequently asked questions
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {FAQS.map((f, i) => (
          <div
            key={f.question}
            style={{
              padding: "16px 4px",
              borderBottom: i < FAQS.length - 1 ? "1px solid var(--hair)" : "none",
            }}
          >
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 4 }}>
              {f.question}
            </h3>
            <p style={{ margin: 0, fontSize: 13.5, color: "var(--warm-grey)", lineHeight: 1.5 }}>
              {f.answer}
            </p>
          </div>
        ))}
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </section>
  );
}
