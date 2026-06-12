import { ModulePlaceholder } from "@/components/module-placeholder";

export default function RedTeamPage() {
  return (
    <ModulePlaceholder
      eyebrow="Red Team"
      title="Validación controlada"
      description="Módulo para rutas de ataque teóricas, checklists y validaciones autorizadas con aprobación humana, scope definido y auditoría."
      items={[
        "Rutas de ataque teóricas",
        "Checklists de validación",
        "Scope autorizado obligatorio",
        "Aprobación humana para acciones sensibles",
      ]}
    />
  );
}
