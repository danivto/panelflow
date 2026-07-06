import { SiteHeader, SiteFooter } from "@/components/SiteChrome";

export default function EnglishLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SiteHeader locale="en" />
      <main className="flex-1">{children}</main>
      <SiteFooter locale="en" />
    </>
  );
}
