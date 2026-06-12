type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
};

export function MetricCard({ label, value, detail }: MetricCardProps) {
  return (
    <article className="rounded-2xl border border-cyan-400/10 bg-slate-950/55 p-4 shadow-2xl shadow-cyan-950/20 sm:p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-3 break-words text-xl font-semibold sm:text-2xl">
        {value}
      </p>
      <p className="mt-2 text-xs leading-5 text-slate-500">{detail}</p>
    </article>
  );
}
