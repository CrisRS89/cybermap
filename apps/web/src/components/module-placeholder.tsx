type ModulePlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
  items: string[];
};

export function ModulePlaceholder({
  eyebrow,
  title,
  description,
  items,
}: ModulePlaceholderProps) {
  return (
    <main className="min-h-screen px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-5xl rounded-3xl border border-cyan-400/10 bg-slate-950/60 p-6 shadow-2xl shadow-cyan-950/20 sm:p-8">
        <p className="text-sm text-cyan-300">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {title}
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-400">
          {description}
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <article
              key={item}
              className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 text-sm text-slate-300"
            >
              {item}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
