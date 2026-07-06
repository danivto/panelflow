"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ACCEPTED_EXTS,
  OUTPUT_FORMATS,
  PROFILES,
  formatBytes,
} from "@/lib/formats";
import { converterCopy, type Locale } from "@/lib/i18n";
import AdBanner from "@/components/AdBanner";

type Phase = "idle" | "uploading" | "processing" | "done" | "error";

type Meta = {
  title: string;
  pagesIn: number;
  pagesOut: number;
  bytes: number;
};

// In development the browser posts straight to uvicorn (the Next dev proxy
// cannot forward large upload bodies); in production this is empty and the
// request stays same-origin.
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

function extOf(name: string) {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i).toLowerCase() : "";
}

export default function Converter({ locale = "en" }: { locale?: Locale }) {
  const t = converterCopy[locale];

  const [files, setFiles] = useState<File[]>([]);
  const [mode, setMode] = useState<"smart" | "normal">("smart");
  const [output, setOutput] = useState("cbz");
  const [profile, setProfile] = useState("kindle");
  const [rtl, setRtl] = useState(false);
  const [splitDouble, setSplitDouble] = useState(true);
  const [trim, setTrim] = useState(true);
  const [panels, setPanels] = useState(true);
  const [customW, setCustomW] = useState(1080);
  const [customH, setCustomH] = useState(1620);
  const [customGray, setCustomGray] = useState(false);
  const [quality, setQuality] = useState(85);

  const [phase, setPhase] = useState<Phase>("idle");
  const [uploadPct, setUploadPct] = useState(0);
  const [noteIdx, setNoteIdx] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    url: string;
    filename: string;
    meta: Meta | null;
  } | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // rotate status notes while the server is working
  useEffect(() => {
    if (phase !== "processing") return;
    const timer = setInterval(() => {
      setNoteIdx((i) => (i + 1) % t.processingNotes.length);
    }, 1800);
    return () => clearInterval(timer);
  }, [phase, t.processingNotes.length]);

  // never leak object URLs
  useEffect(() => {
    return () => {
      if (result?.url) URL.revokeObjectURL(result.url);
    };
  }, [result]);

  const acceptFiles = useCallback(
    (list: FileList | File[]) => {
      const ok: File[] = [];
      const bad: string[] = [];
      for (const f of Array.from(list)) {
        if (ACCEPTED_EXTS.includes(extOf(f.name))) ok.push(f);
        else bad.push(f.name);
      }
      if (bad.length) {
        setError(t.skippedFiles(bad.join(", ")));
      } else {
        setError("");
      }
      if (ok.length) {
        setFiles(ok);
        setPhase("idle");
        setResult(null);
      }
    },
    [t]
  );

  const totalSize = files.reduce((s, f) => s + f.size, 0);
  const busy = phase === "uploading" || phase === "processing";

  function reset() {
    xhrRef.current?.abort();
    setFiles([]);
    setPhase("idle");
    setError("");
    setResult(null);
    setUploadPct(0);
    if (inputRef.current) inputRef.current.value = "";
  }

  function startConversion() {
    if (!files.length || busy) return;
    setError("");
    setResult(null);
    setUploadPct(0);
    setNoteIdx(0);
    setPhase("uploading");

    const form = new FormData();
    for (const f of files) form.append("files", f, f.name);
    form.append("mode", mode);
    form.append("output", output);
    form.append("profile", profile);
    form.append("rtl", String(rtl));
    form.append("split_double", String(splitDouble));
    form.append("trim", String(trim));
    form.append("panels", String(panels));
    form.append("custom_quality", String(quality));
    if (profile === "custom") {
      form.append("custom_width", String(customW));
      form.append("custom_height", String(customH));
      form.append("custom_grayscale", String(customGray));
    }

    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;
    xhr.open("POST", `${API_BASE}/api/py/convert`);
    xhr.responseType = "blob";

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 100);
        setUploadPct(pct);
        if (pct >= 100) setPhase("processing");
      }
    };
    xhr.upload.onload = () => setPhase("processing");

    xhr.onload = async () => {
      if (xhr.status === 200) {
        const blob = xhr.response as Blob;
        const dispo = xhr.getResponseHeader("Content-Disposition") || "";
        const m = /filename\*=UTF-8''([^;]+)/.exec(dispo);
        const filename = m
          ? decodeURIComponent(m[1])
          : /filename="([^"]+)"/.exec(dispo)?.[1] || "panelflow-output";
        let meta: Meta | null = null;
        try {
          meta = JSON.parse(xhr.getResponseHeader("X-PanelFlow-Meta") || "");
        } catch {
          meta = null;
        }
        setResult({ url: URL.createObjectURL(blob), filename, meta });
        setPhase("done");
      } else {
        let message = t.genericError;
        try {
          const text = await (xhr.response as Blob).text();
          message = JSON.parse(text).error || message;
        } catch {
          /* keep default */
        }
        setError(message);
        setPhase("error");
      }
    };
    xhr.onerror = () => {
      setError(t.networkError);
      setPhase("error");
    };
    xhr.send(form);
  }

  const smartActive = mode === "smart";

  return (
    <section id="converter" className="mx-auto max-w-3xl px-4">
      <div className="panel p-5 sm:p-7">
        {/* -------------------------------------------------- file drop */}
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            acceptFiles(e.dataTransfer.files);
          }}
          className={`block cursor-pointer border-3 border-dashed border-ink p-6 sm:p-10 text-center transition-colors ${
            dragOver ? "bg-mark/30" : "bg-paper hover:bg-paper-deep"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={ACCEPTED_EXTS.join(",")}
            className="sr-only"
            onChange={(e) => e.target.files && acceptFiles(e.target.files)}
            disabled={busy}
          />
          {files.length === 0 ? (
            <>
              <p className="font-display text-lg sm:text-xl">{t.dropTitle}</p>
              <p className="mt-2 text-sm text-ink-soft">{t.dropHint}</p>
            </>
          ) : (
            <>
              <p className="font-display text-lg break-all">
                {files.length === 1
                  ? files[0].name
                  : t.imagesSelected(files.length)}
              </p>
              <p className="mt-1 text-sm text-ink-soft">
                {formatBytes(totalSize)} — {t.clickToChange}
              </p>
            </>
          )}
        </label>

        {/* -------------------------------------------------- mode */}
        <div className="mt-6">
          <p className="text-xs font-bold uppercase tracking-widest text-ink-soft">
            {t.modeLabel}
          </p>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMode("smart")}
              disabled={busy}
              aria-pressed={smartActive}
              className={`panel-flat p-4 text-left transition-transform ${
                smartActive
                  ? "bg-accent text-white -translate-y-0.5 shadow-[4px_4px_0_0_var(--color-ink)]"
                  : "bg-white hover:bg-paper-deep"
              }`}
            >
              <span className="font-display block">{t.smartTitle}</span>
              <span
                className={`mt-1 block text-xs leading-snug ${smartActive ? "text-white/85" : "text-ink-soft"}`}
              >
                {t.smartDesc}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setMode("normal")}
              disabled={busy}
              aria-pressed={!smartActive}
              className={`panel-flat p-4 text-left transition-transform ${
                !smartActive
                  ? "bg-accent text-white -translate-y-0.5 shadow-[4px_4px_0_0_var(--color-ink)]"
                  : "bg-white hover:bg-paper-deep"
              }`}
            >
              <span className="font-display block">{t.normalTitle}</span>
              <span
                className={`mt-1 block text-xs leading-snug ${!smartActive ? "text-white/85" : "text-ink-soft"}`}
              >
                {t.normalDesc}
              </span>
            </button>
          </div>
        </div>

        {/* -------------------------------------------------- output format */}
        <div className="mt-6">
          <p className="text-xs font-bold uppercase tracking-widest text-ink-soft">
            {t.outputLabel}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {OUTPUT_FORMATS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setOutput(f.id)}
                disabled={busy}
                aria-pressed={output === f.id}
                title={t.formatHints[f.id]}
                className={`border-3 border-ink px-3 py-1.5 text-sm font-bold ${
                  output === f.id
                    ? "bg-ink text-paper"
                    : "bg-white hover:bg-paper-deep"
                }`}
              >
                {t.formatLabels[f.id] ?? f.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-ink-soft">{t.formatHints[output]}</p>
        </div>

        {/* -------------------------------------------------- device profile */}
        {smartActive && (
          <div className="mt-6">
            <p className="text-xs font-bold uppercase tracking-widest text-ink-soft">
              {t.deviceLabel}
            </p>
            <div className="mt-2 grid grid-cols-3 sm:grid-cols-5 gap-2">
              {PROFILES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setProfile(p.id)}
                  disabled={busy}
                  aria-pressed={profile === p.id}
                  className={`border-3 border-ink px-2 py-2 text-center ${
                    profile === p.id
                      ? "bg-ink text-paper"
                      : "bg-white hover:bg-paper-deep"
                  }`}
                >
                  <span className="block text-sm font-bold leading-tight">
                    {t.profileNames[p.id] ?? p.name}
                  </span>
                  <span
                    className={`block text-[10px] mt-0.5 ${profile === p.id ? "text-paper/70" : "text-ink-soft"}`}
                  >
                    {p.id === "custom" ? t.customScreen : p.screen}
                  </span>
                </button>
              ))}
            </div>
            {profile === "custom" && (
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 border-3 border-ink bg-paper-deep p-3">
                <label className="text-xs font-bold">
                  {t.widthLabel}
                  <input
                    type="number"
                    min={240}
                    max={4096}
                    value={customW}
                    onChange={(e) => setCustomW(Number(e.target.value))}
                    className="mt-1 w-full border-3 border-ink bg-white px-2 py-1 font-sans"
                  />
                </label>
                <label className="text-xs font-bold">
                  {t.heightLabel}
                  <input
                    type="number"
                    min={240}
                    max={4096}
                    value={customH}
                    onChange={(e) => setCustomH(Number(e.target.value))}
                    className="mt-1 w-full border-3 border-ink bg-white px-2 py-1 font-sans"
                  />
                </label>
                <label className="flex items-end gap-2 pb-1 text-xs font-bold">
                  <input
                    type="checkbox"
                    checked={customGray}
                    onChange={(e) => setCustomGray(e.target.checked)}
                    className="w-4 h-4 accent-(--color-accent)"
                  />
                  {t.grayscaleLabel}
                </label>
              </div>
            )}
          </div>
        )}

        {/* -------------------------------------------------- advanced */}
        <details className="mt-6 group">
          <summary className="cursor-pointer text-sm font-bold select-none">
            {t.advancedLabel}{" "}
            <span className="text-ink-soft font-normal">
              {t.advancedOptional}
            </span>
          </summary>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 border-3 border-ink bg-paper-deep p-4 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={rtl}
                onChange={(e) => setRtl(e.target.checked)}
                className="w-4 h-4 accent-(--color-accent)"
              />
              {t.rtlLabel}
            </label>
            {smartActive && (
              <>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={splitDouble}
                    onChange={(e) => setSplitDouble(e.target.checked)}
                    className="w-4 h-4 accent-(--color-accent)"
                  />
                  {t.splitLabel}
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={trim}
                    onChange={(e) => setTrim(e.target.checked)}
                    className="w-4 h-4 accent-(--color-accent)"
                  />
                  {t.trimLabel}
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={panels}
                    onChange={(e) => setPanels(e.target.checked)}
                    className="w-4 h-4 accent-(--color-accent)"
                  />
                  {t.panelsLabel}
                </label>
              </>
            )}
            <label className="flex items-center gap-3 sm:col-span-2">
              <span className="whitespace-nowrap">{t.qualityLabel}</span>
              <input
                type="range"
                min={60}
                max={100}
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="flex-1 accent-(--color-accent)"
              />
              <span className="w-8 text-right font-bold">{quality}</span>
            </label>
          </div>
        </details>

        {/* -------------------------------------------------- action / status */}
        <div className="mt-7">
          {phase === "idle" || phase === "error" ? (
            <button
              type="button"
              onClick={startConversion}
              disabled={!files.length}
              className="w-full border-3 border-ink bg-mark py-3.5 font-display text-lg tracking-wide shadow-[5px_5px_0_0_var(--color-ink)] enabled:hover:-translate-y-0.5 enabled:hover:shadow-[7px_7px_0_0_var(--color-ink)] enabled:active:translate-y-0 enabled:active:shadow-[3px_3px_0_0_var(--color-ink)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {files.length ? t.convertNow : t.chooseFirst}
            </button>
          ) : null}

          {busy && (
            <div className="border-3 border-ink bg-white p-4">
              <div className="flex justify-between text-sm font-bold">
                <span>
                  {phase === "uploading"
                    ? t.uploading(uploadPct)
                    : t.processingNotes[noteIdx]}
                </span>
                <button
                  type="button"
                  onClick={reset}
                  className="underline hover:text-accent font-normal"
                >
                  {t.cancel}
                </button>
              </div>
              <div className="mt-2 h-4 border-3 border-ink bg-paper overflow-hidden">
                {phase === "uploading" ? (
                  <div
                    className="h-full bg-accent transition-[width] duration-200"
                    style={{ width: `${uploadPct}%` }}
                  />
                ) : (
                  <div className="h-full w-full stripes-live" />
                )}
              </div>
              {phase === "processing" && (
                <p className="mt-2 text-xs text-ink-soft">
                  {t.processingPrivacy}
                </p>
              )}
            </div>
          )}

          {phase === "done" && result && (
            <div className="border-3 border-ink bg-white p-5 text-center">
              <p className="font-display text-lg">{t.done}</p>
              {result.meta && (
                <p className="mt-1 text-sm text-ink-soft">
                  {t.pagesSummary(
                    result.meta.pagesIn,
                    result.meta.pagesOut,
                    formatBytes(result.meta.bytes)
                  )}
                </p>
              )}
              <a
                href={result.url}
                download={result.filename}
                className="mt-4 inline-block border-3 border-ink bg-accent px-8 py-3 font-display text-white tracking-wide shadow-[5px_5px_0_0_var(--color-ink)] hover:-translate-y-0.5 hover:shadow-[7px_7px_0_0_var(--color-ink)] transition-all"
              >
                {t.download} {result.filename}
              </a>
              <div className="mt-3">
                <button
                  type="button"
                  onClick={reset}
                  className="text-sm underline hover:text-accent"
                >
                  {t.convertAnother}
                </button>
              </div>
              <p className="mt-3 text-xs text-ink-soft">{t.discardedNote}</p>
              <AdBanner slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_RESULT} />
            </div>
          )}
        </div>

        {error && (
          <div
            role="alert"
            className="mt-4 border-3 border-ink bg-mark/40 p-3 text-sm"
          >
            <span className="font-bold">{t.errorPrefix} </span>
            {error}
          </div>
        )}
      </div>
    </section>
  );
}
