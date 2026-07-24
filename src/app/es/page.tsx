import type { Metadata } from "next";
import Link from "next/link";
import Converter from "@/components/Converter";
import AdBanner from "@/components/AdBanner";
import DemoVideo from "@/components/DemoVideo";
import { ARTICLES } from "@/lib/articles";

export const metadata: Metadata = {
  alternates: {
    canonical: "/es",
    languages: { en: "/", es: "/es" },
  },
};

const FAQ = [
  {
    q: "¿Cómo convierto cómics CBZ o CBR para Kindle?",
    a: "Suelta tu archivo CBZ o CBR, elige el perfil Kindle y selecciona EPUB o PDF como salida. La conversión inteligente redimensiona cada página (o cada viñeta) a la pantalla del Kindle, la convierte a escala de grises de alto contraste y genera un archivo que puedes enviar con Send to Kindle.",
  },
  {
    q: "¿Qué hace exactamente la conversión inteligente?",
    a: "Analiza cada página con visión por computadora: encuentra las viñetas, elimina los márgenes vacíos, detecta las páginas dobles y reconstruye el cómic para que cada viñeta — o grupo de viñetas que van juntas — llene tu pantalla. Los cortes solo se hacen por las calles vacías entre viñetas, así que los globos de diálogo y las escenas que las cruzan nunca se parten.",
  },
  {
    q: "¿Funciona con manga, webtoons y manhwa?",
    a: "Sí. Activa el orden de lectura de derecha a izquierda para que el manga mantenga la secuencia correcta de viñetas. Las tiras verticales de webtoon/manhwa se re-paginan automáticamente por sus huecos naturales en páginas del tamaño de tu pantalla.",
  },
  {
    q: "¿Mis archivos se guardan en algún sitio?",
    a: "No. Los archivos se procesan íntegramente en memoria, el resultado se envía directo a tu navegador y todo se descarta en cuanto termina la conversión. No hay cuentas, ni base de datos, ni almacenamiento de archivos.",
  },
  {
    q: "¿Qué formatos son compatibles?",
    a: "Entrada: PDF, CBZ, CBR, ZIP con imágenes, JPG, PNG y WEBP. Salida: PDF optimizado, CBZ, EPUB de diseño fijo, un ZIP de imágenes numeradas, conversiones de imagen simples (JPG/PNG/WEBP) y el contenedor TomoRead (.trc).",
  },
  {
    q: "¿TomoRead es gratis de verdad?",
    a: "Sí. TomoRead se mantiene con un par de anuncios discretos — un banner aquí y otro en el paso de descarga. Sin muros de pago, sin registro y sin límite de conversiones.",
  },
];

const STEPS = [
  {
    n: "1",
    title: "Suelta un archivo",
    text: "PDF, CBZ, CBR, ZIP o imágenes sueltas. No sale del proceso de conversión.",
  },
  {
    n: "2",
    title: "Elige dispositivo y modo",
    text: "Kindle, Kobo, Boox, PocketBook, Xteink X4, móvil o tableta. Inteligente o normal.",
  },
  {
    n: "3",
    title: "Las viñetas se vuelven páginas",
    text: "La visión por computadora recorta márgenes, separa páginas dobles y ordena las viñetas.",
  },
  {
    n: "4",
    title: "Descarga y lee",
    text: "Llévate el archivo optimizado. No se guarda nada — el servidor te olvida al instante.",
  },
];

export default function HomeEs() {
  return (
    <>
      {/* ------------------------------------------------------------ hero */}
      <section className="relative overflow-hidden border-b-3 border-ink">
        <div aria-hidden className="halftone absolute inset-0" />
        <div className="relative mx-auto max-w-5xl px-4 pt-12 pb-10 sm:pt-16 sm:pb-14 text-center">
          <p className="inline-block border-3 border-ink bg-mark px-3 py-1 text-xs font-bold uppercase tracking-widest">
            Gratis · Sin registro · Tus archivos no se guardan
          </p>
          <h1 className="mt-5 font-display text-4xl sm:text-6xl leading-[1.05] tracking-tight">
            Tus cómics,
            <br />
            <span className="text-accent">viñeta a viñeta</span>,
            <br />
            en cualquier pantalla.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base sm:text-lg text-ink-soft">
            TomoRead convierte cómics CBZ, CBR y PDF en archivos hechos para
            Kindle, Kobo, Boox, PocketBook y móviles. La detección inteligente
            de viñetas convierte cada viñeta en una página legible — se acabó
            hacer zoom y arrastrar.
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------- converter */}
      <div className="-mt-6 sm:-mt-8 relative z-10 pb-4">
        <Converter locale="es" />
      </div>

      <AdBanner slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME} />

      {/* ------------------------------------------------------------ demo */}
      <DemoVideo
        title="Míralo en acción"
        caption="Una conversión real: un cómic CBR apaisado convertido en páginas viñeta a viñeta para un Kindle. Cada viñeta se convierte en una página completa y legible — sin hacer zoom."
      />

      {/* ---------------------------------------------------- how it works */}
      <section id="how" className="mx-auto max-w-5xl px-4 py-14">
        <h2 className="font-display text-2xl sm:text-3xl">Cómo funciona</h2>
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
          ¿Primera vez? Sigue la{" "}
          <a href="/es/guia" className="underline text-accent font-bold">
            guía paso a paso
          </a>
          .
        </p>
      </section>

      {/* -------------------------------------------------- smart vs normal */}
      <section className="border-y-3 border-ink bg-ink text-paper">
        <div className="mx-auto max-w-5xl px-4 py-14 grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl">
              Conversión inteligente,{" "}
              <span className="text-mark">pensada para e-ink</span>
            </h2>
            <ul className="mt-5 space-y-3 text-sm sm:text-base">
              {[
                "Detección de viñetas que sigue las calles — los globos y personajes nunca se cortan por la mitad",
                "Páginas dobles separadas correctamente (o enteras cuando el dibujo cruza el pliegue)",
                "Webtoons y manhwa re-paginados por sus huecos naturales",
                "Orden de lectura derecha-a-izquierda para manga",
                "Márgenes recortados, contraste ajustado y páginas enfocadas para pantallas e-ink",
                "Las escenas que comparten tinta permanecen juntas — la narrativa nunca se rompe",
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
              O un simple <span className="text-mark">cambio de formato</span>
            </h2>
            <p className="mt-5 text-sm sm:text-base text-paper/80 leading-relaxed">
              El modo normal es un conversor directo: PDF → CBZ, CBR → CBZ, CBZ
              → EPUB, imágenes → PDF, WEBP → JPG y cualquier otra combinación.
              Las páginas, el orden y la calidad se conservan exactamente —
              cuando el origen y el destino lo permiten, las imágenes se
              reempaquetan sin recodificar: pérdida de calidad cero.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-2 text-center text-sm font-bold">
              {["PDF ⇄ CBZ", "CBR → CBZ", "CBZ → EPUB", "Imágenes → PDF", "WEBP → JPG", "PDF → Imágenes"].map(
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
            <h2 className="font-display text-2xl">Privado por arquitectura</h2>
            <p className="mt-2 text-sm sm:text-base text-ink-soft leading-relaxed">
              TomoRead no tiene cuentas, ni base de datos, ni almacenamiento
              de archivos. Tu cómic se convierte en memoria y vuelve directo a
              ti; cuando la petición termina, tanto el original como el
              resultado desaparecen del servidor. No podríamos quedarnos tus
              archivos ni queriendo.
            </p>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- guides */}
      <section className="mx-auto max-w-5xl px-4 py-14">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-display text-2xl sm:text-3xl">Guías</h2>
          <Link
            href="/es/articulos"
            className="text-sm font-bold text-accent hover:underline shrink-0"
          >
            Todas las guías →
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {ARTICLES.map((a) => (
            <Link
              key={a.slug}
              href={`/es/articulos/${a.slug}`}
              className="block panel-flat bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_var(--color-ink)]"
            >
              <h3 className="font-display text-lg leading-snug">{a.es.title}</h3>
              <p className="mt-1.5 text-sm text-ink-soft leading-relaxed">
                {a.es.description}
              </p>
              <span className="mt-2 inline-block text-xs font-bold uppercase tracking-widest text-accent">
                {a.es.minutes} min de lectura →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------- faq */}
      <section id="faq" className="mx-auto max-w-3xl px-4 pb-16">
        <h2 className="font-display text-2xl sm:text-3xl">
          Preguntas frecuentes
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
            inLanguage: "es",
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
