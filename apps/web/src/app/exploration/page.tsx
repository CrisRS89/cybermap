import { ModulePlaceholder } from "@/components/module-placeholder";

export default function ExplorationPage() {
  return (
    <ModulePlaceholder
      eyebrow="Exploration"
      title="Superficie de ataque"
      description="Módulo para importar escaneos, normalizar activos, visualizar hosts, puertos, servicios y construir el mapa inicial de exposición."
      items={[
        "Importación de Nmap XML",
        "Importación futura de Nuclei JSON",
        "Mapa visual de hosts y servicios",
        "Historial de escaneos y evidencias",
      ]}
    />
  );
}
