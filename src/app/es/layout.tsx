import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";

export const metadata: Metadata = {
  title: {
    default: "TomoRead — Conversor de cómics y manga para lectores e-ink",
    template: "%s · TomoRead",
  },
  description:
    "Conversor de cómics online y gratuito. Convierte CBZ, CBR y PDF en archivos listos para Kindle, Kobo y Boox. La conversión inteligente adapta manga, cómics y webtoons a pantallas pequeñas — sin registro y sin guardar tus archivos.",
  openGraph: {
    title: "TomoRead — Conversor de cómics y manga para lectores e-ink",
    description:
      "Convierte y optimiza cómics para Kindle, Kobo, Boox y móviles. Detección inteligente de viñetas, privado por diseño.",
    type: "website",
    siteName: "TomoRead",
    locale: "es_ES",
  },
};

export default function SpanishLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SiteHeader locale="es" />
      <main className="flex-1" lang="es">
        {children}
      </main>
      <SiteFooter locale="es" />
    </>
  );
}
