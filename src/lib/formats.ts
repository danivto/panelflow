export const ACCEPTED_EXTS = [
  ".pdf",
  ".cbz",
  ".cbr",
  ".cb7",
  ".zip",
  ".7z",
  ".epub",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
];

export type OutputFormat = {
  id: string;
  label: string;
  hint: string;
};

export const OUTPUT_FORMATS: OutputFormat[] = [
  { id: "cbz", label: "CBZ", hint: "Comic archive — best for e-ink readers and comic apps" },
  { id: "pdf", label: "PDF", hint: "Universal — opens anywhere" },
  { id: "epub", label: "EPUB", hint: "Fixed-layout images — Kindle, Kobo, Boox libraries" },
  { id: "images", label: "Images (ZIP)", hint: "Numbered JPG pages in a folder" },
  { id: "trc", label: "TomoRead (.trc)", hint: "TomoRead container, ready for future apps" },
  { id: "jpg", label: "JPG", hint: "Convert every page/image to JPG" },
  { id: "png", label: "PNG", hint: "Convert every page/image to PNG" },
  { id: "webp", label: "WEBP", hint: "Convert every page/image to WEBP" },
];

export type Profile = {
  id: string;
  name: string;
  screen: string;
  eink: boolean;
};

export const PROFILES: Profile[] = [
  { id: "kindle", name: "Kindle", screen: "1236 × 1648", eink: true },
  { id: "kobo", name: "Kobo", screen: "1264 × 1680", eink: true },
  { id: "boox", name: "Boox", screen: "1404 × 1872", eink: true },
  { id: "pocketbook", name: "PocketBook", screen: "758 × 1024", eink: true },
  { id: "xteink-x4", name: "Xteink X4", screen: "480 × 800", eink: true },
  { id: "android", name: "Android", screen: "1080 × 2340", eink: false },
  { id: "iphone", name: "iPhone", screen: "1179 × 2556", eink: false },
  { id: "tablet", name: "Tablet", screen: "1620 × 2160", eink: false },
  { id: "custom", name: "Custom", screen: "your size", eink: false },
];

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
