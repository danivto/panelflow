import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "TomoRead privacy policy: files are converted in memory, never stored, and no accounts or databases exist.",
  alternates: {
    canonical: "/privacy",
    languages: { en: "/privacy", es: "/es/privacidad" },
  },
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-3xl sm:text-4xl">Privacy</h1>
      <p className="mt-3 text-ink-soft">
        The short version: your files are never stored, and we don&apos;t know
        who you are.
      </p>

      <div className="mt-8 space-y-8 text-sm sm:text-base leading-relaxed">
        <section className="panel p-5">
          <h2 className="font-display text-xl">Your files</h2>
          <ul className="mt-3 list-disc pl-5 space-y-2">
            <li>
              Uploaded files are processed <strong>entirely in memory</strong>{" "}
              on a stateless serverless function.
            </li>
            <li>
              The converted file is streamed straight back to your browser.
              When the request finishes — or if it fails — every trace of the
              original and the result is discarded automatically.
            </li>
            <li>
              We never read, index, log or analyze the content of your
              documents.
            </li>
            <li>
              There is no upload bucket, no temp folder that outlives the
              request, and no way for us to retrieve a file after conversion.
            </li>
          </ul>
        </section>

        <section className="panel p-5">
          <h2 className="font-display text-xl">Your identity</h2>
          <ul className="mt-3 list-disc pl-5 space-y-2">
            <li>No accounts, no signup, no login.</li>
            <li>
              No database of any kind — we store no conversion history, no
              metadata, no user records.
            </li>
            <li>
              Standard, anonymous server logs (status codes, timing) may exist
              briefly at our hosting provider for operational health; they
              never include file contents.
            </li>
          </ul>
        </section>

        <section className="panel p-5">
          <h2 className="font-display text-xl">Advertising</h2>
          <p className="mt-3">
            TomoRead is funded by Google AdSense, limited to two discreet
            banners. Google may use cookies to serve ads; see{" "}
            <a
              className="underline text-accent"
              href="https://policies.google.com/technologies/ads"
              rel="noopener noreferrer"
              target="_blank"
            >
              Google&apos;s advertising policies
            </a>{" "}
            for details and opt-out options. We never show popups,
            interstitials or auto-playing video ads.
          </p>
        </section>

        <section className="panel p-5">
          <h2 className="font-display text-xl">Your content, your rights</h2>
          <p className="mt-3">
            Only convert files you own or have the right to use. TomoRead is
            a format tool, like a photocopier: what you feed it is your
            responsibility, and what comes out belongs to you.
          </p>
        </section>
      </div>
    </article>
  );
}
