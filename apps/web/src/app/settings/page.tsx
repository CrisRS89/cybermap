import { ModulePlaceholder } from "@/components/module-placeholder";

export default function SettingsPage() {
  return (
    <ModulePlaceholder
      eyebrow="Settings"
      title="Configuración de CyberMap"
      description="Pantalla inicial para configurar proveedores de IA, agentes, MCP, conectores, idioma, tema visual, fondos y políticas de seguridad."
      items={[
        "AI Provider Gateway",
        "Agent Hub",
        "MCP Servers",
        "Temas, idioma y apariencia",
      ]}
    />
  );
}
