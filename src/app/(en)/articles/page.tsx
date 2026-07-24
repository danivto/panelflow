import type { Metadata } from "next";
import Link from "next/link";
import { ARTICLES } from "@/lib/articles";

export const metadata: Metadata = {
  title: "Guides: reading comics & manga on e-readers",
  description:
    "In-depth guides on reading and converting comics and manga for Kindle, Kobo, Boox and other e-readers — formats, settings, reading direction and transfer.",
  alternates: {
    canonical: "/articles",
    languages: { en: "/articles", es: "/es/articulos" },
  },
};

export default function ArticlesIndex() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-display text-3xl sm:text-4xl">Guides</h1>
      <p className="mt-3 text-ink-soft">
        Everything we've learned about making comics and manga readable on
        small e-ink screens — the formats, the settings, and the quirks of each
        device.
      </p>

      <div className="mt-8 space-y-4">
        {ARTICLES.map((a) => (
          <Link
            key={a.slug}
            href={`/articles/${a.slug}`}
            className="block panel-flat bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_var(--color-ink)]"
          >
            <h2 className="font-display text-lg">{a.en.title}</h2>
            <p className="mt-1.5 text-sm text-ink-soft leading-relaxed">
              {a.en.description}
            </p>
            <span className="mt-2 inline-block text-xs font-bold uppercase tracking-widest text-accent">
              {a.en.minutes} min read →
            </span>
          </Link>
        ))}
      </div>

      <p className="mt-8 text-sm">
        <Link
          href="/#converter"
          className="inline-block border-3 border-ink bg-mark px-5 py-2.5 font-display shadow-[4px_4px_0_0_var(--color-ink)] hover:-translate-y-0.5 transition-all"
        >
          Go to the converter
        </Link>
      </p>
    </div>
  );
}
