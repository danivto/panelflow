import type { MetadataRoute } from "next";
import { ARTICLES } from "@/lib/articles";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://tomoread.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entry = (
    path: string,
    priority: number,
    languages?: Record<string, string>
  ) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority,
    ...(languages ? { alternates: { languages } } : {}),
  });

  return [
    entry("/", 1, { en: `${BASE}/`, es: `${BASE}/es` }),
    entry("/es", 1, { en: `${BASE}/`, es: `${BASE}/es` }),
    entry("/guide", 0.8, { en: `${BASE}/guide`, es: `${BASE}/es/guia` }),
    entry("/es/guia", 0.8, { en: `${BASE}/guide`, es: `${BASE}/es/guia` }),
    entry("/articles", 0.7, {
      en: `${BASE}/articles`,
      es: `${BASE}/es/articulos`,
    }),
    entry("/es/articulos", 0.7, {
      en: `${BASE}/articles`,
      es: `${BASE}/es/articulos`,
    }),
    ...ARTICLES.flatMap((a) => [
      entry(`/articles/${a.slug}`, 0.6, {
        en: `${BASE}/articles/${a.slug}`,
        es: `${BASE}/es/articulos/${a.slug}`,
      }),
      entry(`/es/articulos/${a.slug}`, 0.6, {
        en: `${BASE}/articles/${a.slug}`,
        es: `${BASE}/es/articulos/${a.slug}`,
      }),
    ]),
    entry("/privacy", 0.3, {
      en: `${BASE}/privacy`,
      es: `${BASE}/es/privacidad`,
    }),
    entry("/es/privacidad", 0.3, {
      en: `${BASE}/privacy`,
      es: `${BASE}/es/privacidad`,
    }),
  ];
}
