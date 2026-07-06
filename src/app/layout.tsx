import type { Metadata } from "next";
import { Archivo, Archivo_Black } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

const archivoBlack = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-archivo-black",
  display: "swap",
});

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://panelflow.app"
  ),
  title: {
    default: "PanelFlow — Comic & Manga Converter for E-Readers",
    template: "%s · PanelFlow",
  },
  description:
    "Free online comic converter. Turn CBZ, CBR and PDF comics into Kindle, Kobo and Boox-ready files. Smart panel detection reformats manga, comics and webtoons for small screens — no signup, files never stored.",
  keywords: [
    "cbz to kindle",
    "comic converter",
    "manga for e-readers",
    "convert cbr to epub",
    "pdf comic converter",
    "comic optimizer",
    "cbz to epub",
    "webtoon to kindle",
    "convertidor de comics",
    "manga para kindle",
  ],
  openGraph: {
    title: "PanelFlow — Comic & Manga Converter for E-Readers",
    description:
      "Convert and optimize comics for Kindle, Kobo, Boox and phones. Smart panel detection, private by design.",
    type: "website",
    siteName: "PanelFlow",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${archivo.variable} ${archivoBlack.variable}`}>
      <body className="font-sans antialiased min-h-screen flex flex-col">
        {children}
        {ADSENSE_CLIENT ? (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        ) : null}
      </body>
    </html>
  );
}
