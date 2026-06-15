type SelectFieldProps = {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
};

export function SelectField({ label, value, options, onChange }: SelectFieldProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm text-slate-400">{label}</span>
      <select
        className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-slate-100 outline-none transition focus:border-cyan-400/50"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
