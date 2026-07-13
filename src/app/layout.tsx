import type { Metadata } from "next";
import { Archivo, Archivo_Black } from "next/font/google";
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
    process.env.NEXT_PUBLIC_SITE_URL || "https://tomoread.app"
  ),
  title: {
    default: "TomoRead — Comic & Manga Converter for E-Readers",
    template: "%s · TomoRead",
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
    title: "TomoRead — Comic & Manga Converter for E-Readers",
    description:
      "Convert and optimize comics for Kindle, Kobo, Boox and phones. Smart panel detection, private by design.",
    type: "website",
    siteName: "TomoRead",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${archivo.variable} ${archivoBlack.variable}`}>
      <body className="font-sans antialiased min-h-screen flex flex-col">
        {/* Plain script tag (not next/script): React hoists async scripts
            into <head>, so the AdSense crawler finds the literal tag in the
            served HTML — required for site verification. */}
        {ADSENSE_CLIENT ? (
          // eslint-disable-next-line @next/next/no-sync-scripts
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
          />
        ) : null}
        {children}
      </body>
    </html>
  );
}
