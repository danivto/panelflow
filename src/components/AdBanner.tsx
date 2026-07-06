"use client";

import { useEffect } from "react";

const CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * A single discreet AdSense banner. Renders nothing at all when AdSense is
 * not configured, and always reserves its height to avoid layout shift.
 * PanelFlow policy: exactly one banner on the home page and one on the
 * result state — never popups, interstitials or auto-playing video.
 */
export default function AdBanner({ slot }: { slot?: string }) {
  useEffect(() => {
    if (CLIENT && slot) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch {
        // ad blocked or script unavailable — fine, show nothing
      }
    }
  }, [slot]);

  if (!CLIENT || !slot) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 my-6" aria-hidden>
      <div style={{ minHeight: 90 }}>
        <ins
          className="adsbygoogle"
          style={{ display: "block", minHeight: 90 }}
          data-ad-client={CLIENT}
          data-ad-slot={slot}
          data-ad-format="horizontal"
          data-full-width-responsive="false"
        />
      </div>
    </div>
  );
}
