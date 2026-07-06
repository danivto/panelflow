// Google AdSense requires /ads.txt at the domain root to authorize the
// publisher account. Generated from the same env var that enables ads, so
// it appears automatically once AdSense is configured and 404s until then.
export function GET() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  if (!client) {
    return new Response("Not configured", { status: 404 });
  }
  const publisherId = client.replace(/^ca-/, "");
  return new Response(`google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
