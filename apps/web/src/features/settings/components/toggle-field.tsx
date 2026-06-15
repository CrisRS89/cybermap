type ToggleFieldProps = {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function ToggleField({
  label,
  description,
  checked,
  onChange,
}: ToggleFieldProps) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
      <span>
        <span className="block text-sm font-medium text-slate-100">
          {label}
        </span>
        <span className="mt-1 block text-xs leading-5 text-slate-500">
          {description}
        </span>
      </span>
      <input
        className="mt-1 h-5 w-5 accent-cyan-400"
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}
