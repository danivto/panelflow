/**
 * Before/after demo video generated from a real conversion (public-domain
 * comic). H.264, ~1 MB, no autoplay and no sound: it only plays when the
 * visitor presses play, in line with the site's no-intrusive-media policy.
 */
export default function DemoVideo({
  title,
  caption,
}: {
  title: string;
  caption: string;
}) {
  return (
    <section id="demo" className="mx-auto max-w-3xl px-4 py-14">
      <h2 className="font-display text-2xl sm:text-3xl">{title}</h2>
      <div className="panel mt-6 p-2 sm:p-3">
        <video
          controls
          muted
          playsInline
          preload="metadata"
          poster="/demo-poster.jpg"
          className="w-full h-auto block"
          width={1152}
          height={648}
        >
          <source src="/demo.mp4" type="video/mp4" />
        </video>
      </div>
      <p className="mt-3 text-sm text-ink-soft">{caption}</p>
    </section>
  );
}
