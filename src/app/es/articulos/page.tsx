import type { Metadata } from "next";
import Link from "next/link";
import { ARTICLES } from "@/lib/articles";

export const metadata: Metadata = {
  title: "Guías: leer cómics y manga en lectores electrónicos",
  description:
    "Guías en profundidad sobre leer y convertir cómics y manga para Kindle, Kobo, Boox y otros lectores — formatos, ajustes, sentido de lectura y transferencia.",
  alternates: {
    canonical: "/es/articulos",
    languages: { en: "/articles", es: "/es/articulos" },
  },
};

export default function ArticulosIndex() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-display text-3xl sm:text-4xl">Guías</h1>
      <p className="mt-3 text-ink-soft">
        Todo lo que hemos aprendido sobre hacer legibles los cómics y el manga
        en pantallas pequeñas de tinta electrónica — los formatos, los ajustes
        y las peculiaridades de cada dispositivo.
      </p>

      <div className="mt-8 space-y-4">
        {ARTICLES.map((a) => (
          <Link
            key={a.slug}
            href={`/es/articulos/${a.slug}`}
            className="block panel-flat bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_var(--color-ink)]"
          >
            <h2 className="font-display text-lg">{a.es.title}</h2>
            <p className="mt-1.5 text-sm text-ink-soft leading-relaxed">
              {a.es.description}
            </p>
            <span className="mt-2 inline-block text-xs font-bold uppercase tracking-widest text-accent">
              {a.es.minutes} min de lectura →
            </span>
          </Link>
        ))}
      </div>

      <p className="mt-8 text-sm">
        <Link
          href="/es#converter"
          className="inline-block border-3 border-ink bg-mark px-5 py-2.5 font-display shadow-[4px_4px_0_0_var(--color-ink)] hover:-translate-y-0.5 transition-all"
        >
          Ir al conversor
        </Link>
      </p>
    </div>
  );
}
