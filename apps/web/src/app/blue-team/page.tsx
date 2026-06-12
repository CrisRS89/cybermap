import { ModulePlaceholder } from "@/components/module-placeholder";

export default function BlueTeamPage() {
  return (
    <ModulePlaceholder
      eyebrow="Blue Team"
      title="Priorización defensiva"
      description="Módulo orientado a correlación de activos, servicios, vulnerabilidades, criticidad y recomendaciones de remediación."
      items={[
        "Priorización CVE",
        "Recomendaciones de hardening",
        "Mapeo MITRE ATT&CK",
        "Reportes técnicos y ejecutivos",
      ]}
    />
  );
}
