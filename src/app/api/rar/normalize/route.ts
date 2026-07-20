import { createExtractorFromData } from "node-unrar-js";
import { zipSync } from "fflate";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * Genuine RAR (.cbr) files can't be opened by the Python conversion engine
 * on Vercel: there is no unrar/bsdtar binary in that Linux runtime (only
 * local dev, with WinRAR/bsdtar installed, could do it). node-unrar-js
 * compiles the unrar decoder to WebAssembly, so it needs no system binary
 * and runs the same everywhere - including here.
 *
 * This route re-packages a RAR archive's images into a plain ZIP (a valid
 * .cbz) entirely in memory. The Python pipeline already reads ZIP/CBZ
 * perfectly, so from here on the file behaves exactly like a native CBZ -
 * no changes needed downstream. Callers only reach this route for archives
 * whose magic bytes are "Rar!" (checked client-side); already-ZIP .cbr
 * files skip it entirely and go straight to the existing path.
 */

export const maxDuration = 120;

const IMAGE_EXTS = /\.(jpe?g|png|webp|gif|bmp)$/i;
const DIRECT_RESPONSE_LIMIT = 4 * 1024 * 1024;

function isImageEntry(name: string): boolean {
  const base = name.replace(/\\/g, "/").split("/").pop() ?? name;
  return (
    !base.startsWith(".") && !name.includes("__MACOSX") && IMAGE_EXTS.test(base)
  );
}

function baseName(name: string): string {
  const stem = name.replace(/\.[^./\\]+$/, "");
  return (stem.split(/[/\\]/).pop() || "comic").trim() || "comic";
}

// node-unrar-js locates its own .wasm file via a path relative to itself,
// which breaks under bundling ("Failed to parse URL from unrar.wasm").
// Reading the bytes ourselves and passing them as `wasmBinary` bypasses that
// internal lookup - but a plain `require.resolve()` written in THIS file
// gets rewritten by webpack at build time into an internal numeric module
// id instead of a real path ("path argument must be of type string,
// received number"). `eval("require")` is opaque to webpack's static
// analysis, so it stays the real Node.js `require` at runtime and resolves
// an actual on-disk path in the deployed function.
let cachedWasm: ArrayBuffer | null = null;
function loadUnrarWasm(): ArrayBuffer {
  if (cachedWasm) return cachedWasm;
  // eslint-disable-next-line no-eval
  const nodeRequire = eval("require") as NodeRequire;
  const pkgJsonPath = nodeRequire.resolve("node-unrar-js/package.json");
  const wasmPath = path.join(path.dirname(pkgJsonPath), "dist", "js", "unrar.wasm");
  const buf = readFileSync(wasmPath);
  cachedWasm = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  return cachedWasm;
}

async function extractToZip(data: ArrayBuffer): Promise<Uint8Array> {
  const extractor = await createExtractorFromData({
    data,
    wasmBinary: loadUnrarWasm(),
  });
  const headers = [...extractor.getFileList().fileHeaders];
  const imageHeaders = headers.filter(
    (h) => !h.flags.directory && isImageEntry(h.name)
  );
  if (imageHeaders.length === 0) {
    throw new Error("NO_IMAGES");
  }
  const extracted = extractor.extract({
    files: imageHeaders.map((h) => h.name),
  });

  const zipInput: Record<string, [Uint8Array, { level: 0 }]> = {};
  for (const f of extracted.files) {
    if (!f.extraction) continue;
    const entryName = f.fileHeader.name.replace(/\\/g, "/");
    zipInput[entryName] = [f.extraction, { level: 0 }];
  }
  if (Object.keys(zipInput).length === 0) {
    throw new Error("NO_IMAGES");
  }
  // level 0 = store, no re-encoding of the archive: same lossless-repack
  // guarantee the rest of the pipeline gives CBZ/ZIP inputs.
  return zipSync(zipInput, { level: 0 });
}

export async function POST(request: Request): Promise<Response> {
  let data: ArrayBuffer;
  let name: string;

  try {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const { blobUrl, name: n } = (await request.json()) as {
        blobUrl?: string;
        name?: string;
      };
      if (!blobUrl || !blobUrl.includes(".blob.vercel-storage.com")) {
        return NextResponse.json(
          { error: "Invalid upload reference." },
          { status: 400 }
        );
      }
      const res = await fetch(blobUrl);
      if (!res.ok) {
        return NextResponse.json(
          { error: "Could not read the uploaded file. Please retry." },
          { status: 400 }
        );
      }
      data = await res.arrayBuffer();
      name = n || "comic.cbr";
      // The raw RAR blob's job ends here; delete it now, before spending
      // time decoding it, so nothing outlives its usefulness.
      try {
        const { del } = await import("@vercel/blob");
        await del(blobUrl);
      } catch {
        /* best-effort */
      }
    } else {
      const form = await request.formData();
      const file = form.get("file");
      if (!(file instanceof File)) {
        return NextResponse.json({ error: "No file received." }, { status: 400 });
      }
      data = await file.arrayBuffer();
      name = file.name;
    }
  } catch {
    return NextResponse.json(
      { error: "Malformed request." },
      { status: 400 }
    );
  }

  let zipped: Uint8Array;
  try {
    zipped = await extractToZip(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg === "NO_IMAGES") {
      return NextResponse.json(
        { error: "No images found inside this CBR file." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
        error:
          "Could not open this CBR file. It may be corrupt or password-protected.",
      },
      { status: 400 }
    );
  }

  const outName = `${baseName(name)}.cbz`;

  if (zipped.byteLength <= DIRECT_RESPONSE_LIMIT) {
    return new Response(Buffer.from(zipped), {
      status: 200,
      headers: {
        "content-type": "application/zip",
        "x-normalized-name": encodeURIComponent(outName),
        "cache-control": "no-store",
      },
    });
  }

  const blob = await put(`uploads/${outName}`, Buffer.from(zipped), {
    access: "public",
    addRandomSuffix: true,
  });
  return NextResponse.json({ blobUrl: blob.url, name: outName });
}
