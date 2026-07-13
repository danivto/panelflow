import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Guía: cómo convertir un cómic",
  description:
    "Pasos para convertir un cómic, manga o PDF a un formato optimizado para Kindle, Kobo, Boox o el móvil con TomoRead.",
  alternates: {
    canonical: "/es/guia",
    languages: { en: "/guide", es: "/es/guia" },
  },
};

const STEPS: { title: string; text: string }[] = [
  {
    title: "Abre el conversor",
    text: "Entra en la página principal. No hace falta crear cuenta ni instalar nada.",
  },
  {
    title: "Sube tu archivo",
    text: "Arrastra el archivo al recuadro o haz clic para elegirlo. Puede ser un PDF, CBZ, CBR, ZIP con imágenes, o imágenes sueltas (JPG, PNG, WEBP).",
  },
  {
    title: "Elige el modo de conversión",
    text: "«Conversión inteligente» si vas a leer en una pantalla pequeña (recomendado): detecta las viñetas y reconstruye las páginas. «Conversión normal» si solo quieres cambiar el formato del archivo sin tocar las páginas.",
  },
  {
    title: "Elige el formato de salida",
    text: "CBZ para apps de cómics, EPUB o PDF para Kindle/Kobo/Boox, o imágenes si prefieres los archivos sueltos.",
  },
  {
    title: "Elige tu dispositivo",
    text: "Con la conversión inteligente, selecciona el aparato en el que vas a leer: Kindle, Kobo, Boox, PocketBook, Xteink X4, móvil o tableta. Las páginas se ajustarán a esa pantalla.",
  },
  {
    title: "Si es un manga, díselo",
    text: "Abre «Opciones avanzadas» y marca «Orden de lectura manga (derecha a izquierda)». Así las viñetas y las páginas dobles conservan el orden de lectura japonés. Si es un cómic occidental o un webtoon, deja esta casilla sin marcar.",
  },
  {
    title: "Convierte",
    text: "Pulsa «Convertir ahora» y espera. Verás el progreso; los archivos grandes pueden tardar un par de minutos.",
  },
  {
    title: "Descarga",
    text: "Cuando termine, pulsa «Descargar». Tu archivo original y el convertido se borran del servidor en ese mismo momento.",
  },
];

export default function GuiaPage() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-display text-3xl sm:text-4xl">
        Cómo convertir un cómic
      </h1>
      <p className="mt-3 text-ink-soft">
        Ocho pasos, dos minutos. Sin registro y sin guardar tus archivos.
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
          href="/es#converter"
          className="inline-block border-3 border-ink bg-mark px-5 py-2.5 font-display shadow-[4px_4px_0_0_var(--color-ink)] hover:-translate-y-0.5 transition-all"
        >
          Ir al conversor
        </Link>
      </p>
    </article>
  );
}
