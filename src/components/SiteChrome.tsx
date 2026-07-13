import Link from "next/link";
import { chromeCopy, type Locale } from "@/lib/i18n";

export function SiteHeader({ locale }: { locale: Locale }) {
  const t = chromeCopy[locale];
  return (
    <header className="border-b-3 border-ink bg-paper sticky top-0 z-40">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        <Link href={t.home} className="flex items-center gap-2.5 group">
          <span
            aria-hidden
            className="grid grid-cols-2 gap-[3px] w-7 h-7 border-3 border-ink bg-white p-[3px]"
          >
            <span className="bg-ink" />
            <span className="bg-accent" />
            <span className="bg-accent" />
            <span className="bg-ink" />
          </span>
          <span className="font-display text-xl tracking-tight">
            Tomo<span className="text-accent">Read</span>
          </span>
        </Link>
        <nav className="flex items-center gap-4 sm:gap-5 text-sm font-medium">
          <a href={`${t.home}#how`} className="hidden sm:inline hover:text-accent">
            {t.how}
          </a>
          <Link href={t.guideHref} className="hover:text-accent">
            {t.guide}
          </Link>
          <a href={`${t.home}#faq`} className="hidden sm:inline hover:text-accent">
            {t.faq}
          </a>
          <Link href={t.privacyHref} className="hover:text-accent">
            {t.privacy}
          </Link>
          <Link
            href={t.switchHref}
            title={t.switchTitle}
            className="border-3 border-ink px-2 py-0.5 font-bold hover:bg-ink hover:text-paper"
          >
            {t.switchLabel}
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter({ locale }: { locale: Locale }) {
  const t = chromeCopy[locale];
  return (
    <footer className="border-t-3 border-ink bg-ink text-paper">
      <div className="mx-auto max-w-5xl px-4 py-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between text-sm">
        <p className="max-w-md">
          <span className="font-display">TomoRead</span> {t.footerBlurb}
        </p>
        <div className="flex gap-5">
          <a href={`${t.home}#converter`} className="hover:text-mark">
            {t.convert}
          </a>
          <Link href={t.guideHref} className="hover:text-mark">
            {t.guide}
          </Link>
          <Link href={t.privacyHref} className="hover:text-mark">
            {t.privacy}
          </Link>
        </div>
      </div>
    </footer>
  );
}
