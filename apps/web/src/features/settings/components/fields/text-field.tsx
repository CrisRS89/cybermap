type TextFieldProps = {
  label: string;
  value: string;
  placeholder?: string;
  type?: "text" | "password";
  onChange: (value: string) => void;
};

export function TextField({
  label,
  value,
  placeholder,
  type = "text",
  onChange,
}: TextFieldProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm text-slate-400">{label}</span>
      <input
        className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50"
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
