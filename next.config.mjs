/** @type {import('next').NextConfig} */
const nextConfig = {
  // The dev proxy (rewrites below) aborts upstream requests after 30s by
  // default; large comics legitimately take longer to convert.
  experimental: {
    proxyTimeout: 600_000,
  },
  // node-unrar-js ships a WebAssembly binary next to its JS glue code and
  // locates it at runtime via a path relative to itself. Webpack's bundling
  // rewrites that lookup into a `new URL(...)` call that is invalid inside a
  // bundled Node chunk ("Failed to parse URL from unrar.wasm"). Marking the
  // package external keeps it as a plain runtime `require()` against the
  // untouched node_modules copy, so the .wasm sits right where the library
  // expects it - and Vercel's file tracing still bundles it correctly.
  serverExternalPackages: ["node-unrar-js"],
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
