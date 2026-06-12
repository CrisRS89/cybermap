export const navigationItems = [
  { label: "Dashboard", status: "active" },
  { label: "Exploration", status: "ready" },
  { label: "Blue Team", status: "ready" },
  { label: "Red Team", status: "locked" },
  { label: "Settings", status: "ready" },
];

export const metricCards = [
  {
    label: "Assets detectados",
    value: "0",
    detail: "Esperando importación de escaneos",
  },
  {
    label: "Puertos abiertos",
    value: "0",
    detail: "Sin datos cargados",
  },
  {
    label: "Vulnerabilidades",
    value: "0",
    detail: "CVE pendientes de correlación",
  },
  {
    label: "IA activa",
    value: "No configurada",
    detail: "Configurar proveedor en Settings",
  },
];

export const recentEvents = [
  "Repositorio local inicializado",
  "Frontend Next.js creado",
  "Build y lint validados",
  "Pendiente: diseño de módulos CyberMap",
];

export const agentStatuses = [
  { name: "AI Gateway", state: "Pendiente" },
  { name: "Agent Hub", state: "Pendiente" },
  { name: "MCP Layer", state: "Pendiente" },
  { name: "Connectors", state: "Pendiente" },
];
