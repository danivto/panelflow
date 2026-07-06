import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Guide: how to convert a comic",
  description:
    "Steps to convert a comic, manga or PDF into a format optimized for Kindle, Kobo, Boox or your phone with PanelFlow.",
  alternates: {
    canonical: "/guide",
    languages: { en: "/guide", es: "/es/guia" },
  },
};

const STEPS: { title: string; text: string }[] = [
  {
    title: "Open the converter",
    text: "Go to the home page. No account, no install.",
  },
  {
    title: "Upload your file",
    text: "Drag the file into the box or click to choose it. It can be a PDF, CBZ, CBR, ZIP with images, or loose images (JPG, PNG, WEBP).",
  },
  {
    title: "Pick the conversion mode",
    text: "“Smart conversion” if you read on a small screen (recommended): it detects panels and rebuilds the pages. “Normal conversion” if you only want to change the file format without touching the pages.",
  },
  {
    title: "Pick the output format",
    text: "CBZ for comic apps, EPUB or PDF for Kindle/Kobo/Boox, or images if you prefer loose files.",
  },
  {
    title: "Pick your device",
    text: "With smart conversion, select the device you read on: Kindle, Kobo, Boox, PocketBook, Xteink X4, phone or tablet. Pages are fitted to that screen.",
  },
  {
    title: "If it's a manga, say so",
    text: "Open “Advanced options” and check “Manga reading order (right to left)”. Panels and double pages keep the Japanese reading order. For western comics or webtoons, leave it unchecked.",
  },
  {
    title: "Convert",
    text: "Press “Convert now” and wait. You'll see the progress; large files can take a couple of minutes.",
  },
  {
    title: "Download",
    text: "When it finishes, press “Download”. Your original and the converted file are wiped from the server at that very moment.",
  },
];

export default function GuidePage() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-display text-3xl sm:text-4xl">
        How to convert a comic
      </h1>
      <p className="mt-3 text-ink-soft">
        Eight steps, two minutes. No signup, files never stored.
      </p>

      <ol className="mt-8 space-y-4">
        {STEPS.map((s, i) => (
          <li key={s.title} className="panel-flat bg-white p-4 flex gap-4">
            <span className="grid h-8 w-8 shrink-0 place-items-center border-3 border-ink bg-accent font-display text-white">
              {i + 1}
            </span>
            <div>
              <h2 className="font-bold">{s.title}</h2>
              <p className="mt-1 text-sm text-ink-soft leading-relaxed">
                {s.text}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-8 text-sm">
        <Link
          href="/#converter"
          className="inline-block border-3 border-ink bg-mark px-5 py-2.5 font-display shadow-[4px_4px_0_0_var(--color-ink)] hover:-translate-y-0.5 transition-all"
        >
          Go to the converter
        </Link>
      </p>
    </article>
  );
}
