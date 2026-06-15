import type { SettingsValidationIssue } from "../../settings-validation.types";

type ValidationSummaryProps = {
  issues: SettingsValidationIssue[];
};

export function ValidationSummary({ issues }: ValidationSummaryProps) {
  if (issues.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-amber-300/20 bg-amber-300/5 p-4">
      <p className="text-sm font-medium text-amber-200">
        Configuración con advertencias
      </p>
      <ul className="mt-2 list-inside list-disc space-y-1 text-xs leading-5 text-slate-400">
        {issues.map((issue) => (
          <li key={issue.field}>
            <span className="text-slate-300">{issue.field}</span>:{" "}
            {issue.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
