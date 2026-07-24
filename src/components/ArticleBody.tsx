import type { Block } from "@/lib/articles";

/** Renders an article's content blocks with the site's ink-and-paper styling. */
export default function ArticleBody({ body }: { body: Block[] }) {
  return (
    <div className="mt-8 space-y-5">
      {body.map((block, i) => {
        if (block.type === "h2") {
          return (
            <h2 key={i} className="font-display text-xl sm:text-2xl pt-3">
              {block.text}
            </h2>
          );
        }
        if (block.type === "ul") {
          return (
            <ul key={i} className="space-y-2 pl-1">
              {block.items.map((it, j) => (
                <li key={j} className="flex gap-3 text-ink-soft leading-relaxed">
                  <span
                    aria-hidden
                    className="mt-2 h-2 w-2 shrink-0 bg-accent"
                  />
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          );
        }
        if (block.type === "tip") {
          return (
            <p
              key={i}
              className="border-l-3 border-accent bg-paper-deep px-4 py-3 text-sm leading-relaxed"
            >
              {block.text}
            </p>
          );
        }
        return (
          <p key={i} className="text-ink-soft leading-relaxed">
            {block.text}
          </p>
        );
      })}
    </div>
  );
}
