/** @type {import('next').NextConfig} */
const nextConfig = {
  // The dev proxy (rewrites below) aborts upstream requests after 30s by
  // default; large comics legitimately take longer to convert.
  experimental: {
    proxyTimeout: 600_000,
  },
  // In development the FastAPI server runs separately on :8000.
  // On Vercel, /api/index.py is deployed as a Python serverless function
  // and FastAPI routes every /api/py/* path internally.
  rewrites: async () => [
    {
      source: "/api/py/:path*",
      destination:
        process.env.NODE_ENV === "development"
          ? "http://127.0.0.1:8000/api/py/:path*"
          : "/api/index",
    },
  ],
};

export default nextConfig;
