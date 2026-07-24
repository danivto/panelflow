import type { Metadata } from "next";
import Link from "next/link";
import Converter from "@/components/Converter";
import AdBanner from "@/components/AdBanner";
import DemoVideo from "@/components/DemoVideo";
import { ARTICLES } from "@/lib/articles";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
    languages: { en: "/", es: "/es" },
  },
};

const FAQ = [
  {
    q: "How do I convert CBZ or CBR comics for Kindle?",
    a: "Drop your CBZ or CBR file, pick the Kindle profile and choose EPUB or PDF as the output. Smart conversion resizes every page (or every panel) to the Kindle screen, converts to high-contrast grayscale and packages a file you can send with Send to Kindle.",
  },
  {
    q: "What does Smart conversion actually do?",
    a: "It analyzes each page with computer vision: it finds the panels, removes empty margins, detects double-page spreads, and rebuilds the comic so each panel — or group of panels that belong together — fills your screen. Panels are only separated across pure gutter space, so speech balloons and scenes that cross panels are never cut.",
  },
  {
    q: "Does it work with manga, webtoons and manhwa?",
    a: "Yes. Enable right-to-left reading order for manga to keep panels in the correct sequence. Long vertical webtoon/manhwa strips are automatically re-paginated at empty gaps into screen-sized pages.",
  },
  {
    q: "Are my files stored anywhere?",
    a: "No. Files are processed entirely in memory, the result is streamed back to your browser, and everything is discarded the moment the conversion ends. There are no accounts, no database and no file storage.",
  },
  {
    q: "What formats are supported?",
    a: "Input: PDF, CBZ, CBR, ZIP with images, JPG, PNG and WEBP. Output: optimized PDF, CBZ, fixed-layout EPUB, a ZIP of numbered images, plain image conversions (JPG/PNG/WEBP), and the TomoRead (.trc) container.",
  },
  {
    q: "Is TomoRead really free?",
    a: "Yes. TomoRead is supported by a couple of discreet ads — one banner here and one on the download step. No paywalls, no signup, no limits on how often you convert.",
  },
];

const STEPS = [
  {
    n: "1",
    title: "Drop a file",
    text: "PDF, CBZ, CBR, ZIP or loose images. It never leaves the conversion pipeline.",
  },
  {
    n: "2",
    title: "Pick device & mode",
    text: "Kindle, Kobo, Boox, PocketBook, Xteink X4, phone or tablet. Smart or normal.",
  },
  {
    n: "3",
    title: "Panels become pages",
    text: "Computer vision trims margins, splits spreads and reflows panels in reading order.",
  },
  {
    n: "4",
    title: "Download & read",
    text: "Grab the optimized file. Nothing is stored — the server forgets you instantly.",
  },
];

export default function Home() {
  return (
    <>
      {/* ------------------------------------------------------------ hero */}
      <section className="relative overflow-hidden border-b-3 border-ink">
        <div aria-hidden className="halftone absolute inset-0" />
        <div className="relative mx-auto max-w-5xl px-4 pt-12 pb-10 sm:pt-16 sm:pb-14 text-center">
          <p className="inline-block border-3 border-ink bg-mark px-3 py-1 text-xs font-bold uppercase tracking-widest">
            Free · No signup · Files never stored
          </p>
          <h1 className="mt-5 font-display text-4xl sm:text-6xl leading-[1.05] tracking-tight">
            Your comics,
            <br />
            <span className="text-accent">panel by panel</span>,
            <br />
            on any small screen.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base sm:text-lg text-ink-soft">
            TomoRead converts CBZ, CBR and PDF comics into files made for
            Kindle, Kobo, Boox, PocketBook and phones. Smart panel detection
            turns every panel into a readable page — no more zooming and
            panning.
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------- converter */}
      <div className="-mt-6 sm:-mt-8 relative z-10 pb-4">
        <Converter />
      </div>

      <AdBanner slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME} />

      {/* ------------------------------------------------------------ demo */}
      <DemoVideo
        title="See it in action"
        caption="A real conversion: a landscape CBR comic turned into panel-by-panel pages for a Kindle. Every panel becomes a full, readable page — no zooming."
      />

      {/* ---------------------------------------------------- how it works */}
      <section id="how" className="mx-auto max-w-5xl px-4 py-14">
        <h2 className="font-display text-2xl sm:text-3xl">How it works</h2>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map((s) => (
            <div key={s.n} className="panel p-4 relative">
              <span className="absolute -top-3 -left-3 grid h-9 w-9 place-items-center border-3 border-ink bg-accent font-display text-white">
                {s.n}
              </span>
              <h3 className="mt-4 font-display text-lg">{s.title}</h3>
              <p className="mt-2 text-sm text-ink-soft leading-relaxed">
                {s.text}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm">
          First time?{" "}
          <a href="/guide" className="underline text-accent font-bold">
            Follow the step-by-step guide
          </a>
          .
        </p>
      </section>

      {/* -------------------------------------------------- smart vs normal */}
      <section className="border-y-3 border-ink bg-ink text-paper">
        <div className="mx-auto max-w-5xl px-4 py-14 grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl">
              Smart conversion,{" "}
              <span className="text-mark">built for e-ink</span>
            </h2>
            <ul className="mt-5 space-y-3 text-sm sm:text-base">
              {[
                "Panel detection that follows the gutters — balloons and characters are never cut in half",
                "Double-page spreads split correctly (or kept whole when the art crosses the fold)",
                "Webtoons and manhwa re-paginated at natural gaps",
                "Right-to-left reading order for manga",
                "Margins trimmed, contrast tuned and pages sharpened for grayscale e-ink screens",
                "Scenes that share ink stay together — the narrative is never broken to force a split",
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <span
                    aria-hidden
                    className="mt-1.5 h-2.5 w-2.5 shrink-0 bg-accent"
                  />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-display text-2xl sm:text-3xl">
              Or just a <span className="text-mark">clean format swap</span>
            </h2>
            <p className="mt-5 text-sm sm:text-base text-paper/80 leading-relaxed">
              Normal mode is a straight converter: PDF → CBZ, CBR → CBZ, CBZ →
              EPUB, images → PDF, WEBP → JPG and every other combination.
              Pages, order and quality are preserved exactly — when the source
              and destination allow it, images are repacked without
              re-encoding, so there is zero quality loss.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-2 text-center text-sm font-bold">
              {["PDF ⇄ CBZ", "CBR → CBZ", "CBZ → EPUB", "Images → PDF", "WEBP → JPG", "PDF → Images"].map(
                (t) => (
                  <span key={t} className="border-3 border-paper/60 px-2 py-2">
                    {t}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- privacy */}
      <section className="mx-auto max-w-5xl px-4 py-14">
        <div className="panel p-6 sm:p-8 flex flex-col sm:flex-row items-start gap-5">
          <div
            aria-hidden
            className="halftone-accent h-16 w-16 shrink-0 border-3 border-ink"
          />
          <div>
            <h2 className="font-display text-2xl">Private by architecture</h2>
            <p className="mt-2 text-sm sm:text-base text-ink-soft leading-relaxed">
              TomoRead has no accounts, no database and no file storage. Your
              comic is converted in memory and streamed straight back to you;
              when the request ends, both the original and the result are gone
              from the server. We couldn&apos;t keep your files even if we
              wanted to.
            </p>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- guides */}
      <section className="mx-auto max-w-5xl px-4 py-14">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-display text-2xl sm:text-3xl">Guides</h2>
          <Link
            href="/articles"
            className="text-sm font-bold text-accent hover:underline shrink-0"
          >
            All guides →
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {ARTICLES.map((a) => (
            <Link
              key={a.slug}
              href={`/articles/${a.slug}`}
              className="block panel-flat bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_var(--color-ink)]"
            >
              <h3 className="font-display text-lg leading-snug">{a.en.title}</h3>
              <p className="mt-1.5 text-sm text-ink-soft leading-relaxed">
                {a.en.description}
              </p>
              <span className="mt-2 inline-block text-xs font-bold uppercase tracking-widest text-accent">
                {a.en.minutes} min read →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------- faq */}
      <section id="faq" className="mx-auto max-w-3xl px-4 pb-16">
        <h2 className="font-display text-2xl sm:text-3xl">
          Frequently asked questions
        </h2>
        <div className="mt-6 space-y-3">
          {FAQ.map((item) => (
            <details key={item.q} className="panel-flat bg-white p-4">
              <summary className="cursor-pointer font-bold text-sm sm:text-base select-none">
                {item.q}
              </summary>
              <p className="mt-2 text-sm text-ink-soft leading-relaxed">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        }}
      />
    </>
  );
}
