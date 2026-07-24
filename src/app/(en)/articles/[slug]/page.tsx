import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ARTICLES, getArticle } from "@/lib/articles";
import ArticleBody from "@/components/ArticleBody";

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  return {
    title: article.en.title,
    description: article.en.description,
    alternates: {
      canonical: `/articles/${slug}`,
      languages: {
        en: `/articles/${slug}`,
        es: `/es/articulos/${slug}`,
      },
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();
  const c = article.en;

  return (
    <article className="mx-auto max-w-2xl px-4 py-12">
      <p className="text-xs font-bold uppercase tracking-widest text-ink-soft">
        <Link href="/articles" className="hover:text-accent">
          Guides
        </Link>{" "}
        · {c.minutes} min read
      </p>
      <h1 className="mt-2 font-display text-3xl sm:text-4xl leading-tight">
        {c.title}
      </h1>
      <p className="mt-3 text-lg text-ink-soft leading-relaxed">
        {c.description}
      </p>

      <ArticleBody body={c.body} />

      <div className="mt-10 border-t-3 border-ink pt-6">
        <p className="font-display text-lg">Ready to convert?</p>
        <p className="mt-1 text-sm text-ink-soft">
          Free, no signup, and your files are never stored.
        </p>
        <Link
          href="/#converter"
          className="mt-3 inline-block border-3 border-ink bg-mark px-5 py-2.5 font-display shadow-[4px_4px_0_0_var(--color-ink)] hover:-translate-y-0.5 transition-all"
        >
          Open the converter
        </Link>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: c.title,
            description: c.description,
            dateModified: c.updated,
            inLanguage: "en",
            author: { "@type": "Organization", name: "TomoRead" },
            publisher: { "@type": "Organization", name: "TomoRead" },
          }),
        }}
      />
    </article>
  );
}
