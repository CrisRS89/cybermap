"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";

import { listAiRuns, runAiAgent } from "@/features/ai/ai-api";
import type {
  AgentRunResponse,
  AiRunHistoryItem,
} from "@/features/ai/ai-types";

import {
  createExplorationAsset,
  createExplorationFinding,
  listExplorationAssets,
  listExplorationFindings,
  listExplorationServices,
} from "@/features/exploration/exploration-api";
import {
  importNmapXml,
  runNmapScan,
  type ImportNmapXmlSummary,
} from "@/features/exploration/exploration-imports-api";
import { useCyberMapSettings } from "@/features/settings/use-cybermap-settings";
import {
  MAX_NMAP_XML_FILE_BYTES,
  validateNmapXmlFile,
} from "@/features/exploration/nmap-file";
import { getNmapImportNotice } from "@/features/exploration/nmap-import-feedback";
import { mapRecommendationSeverityToFinding } from "@/features/exploration/recommendation-to-finding";
import type {
  AssetCriticality,
  AssetEnvironment,
  AssetKind,
  ExplorationAsset,
  ExplorationFinding,
  ExplorationService,
  FindingSeverity,
} from "@/features/exploration/exploration-types";

type ExplorationPageState =
  | {
      status: "loading";
      assets: ExplorationAsset[];
      findings: ExplorationFinding[];
      services: ExplorationService[];
      error: null;
    }
  | {
      status: "ready";
      assets: ExplorationAsset[];
      findings: ExplorationFinding[];
      services: ExplorationService[];
      error: null;
    }
  | {
      status: "error";
      assets: ExplorationAsset[];
      findings: ExplorationFinding[];
      services: ExplorationService[];
      error: string;
    };

type AssetFormState = {
  name: string;
  kind: AssetKind;
  value: string;
  environment: AssetEnvironment;
  criticality: AssetCriticality;
};

type FindingFormState = {
  title: string;
  severity: FindingSeverity;
  assetId: string | null;
  evidence: string;
};

type NmapTargetKind = "localhost" | "ip" | "network" | "domain";

type NmapScanProfile = "basic" | "medium" | "complete" | "fast" | "custom_ports";

type NmapCommandFormState = {
  targetKind: NmapTargetKind;
  target: string;
  scanProfile: NmapScanProfile;
  ports: string;
  outputFile: string;
};

const initialAssetForm: AssetFormState = {
  name: "",
  kind: "host",
  value: "",
  environment: "unknown",
  criticality: "medium",
};

const initialFindingForm: FindingFormState = {
  title: "",
  severity: "medium",
  assetId: null,
  evidence: "",
};

const initialNmapCommandForm: NmapCommandFormState = {
  targetKind: "ip",
  target: "192.168.1.10",
  scanProfile: "medium",
  ports: "22,80,443,8000,8080",
  outputFile: "scan.xml",
};

const nmapCommandPresets = [
  {
    title: "Host local",
    command: "nmap -sV -oX scan-local.xml 127.0.0.1",
    description: "Detecta servicios y versiones expuestas en el equipo local.",
  },
  {
    title: "IP específica autorizada",
    command: "nmap -sV -oX scan-ip.xml 192.168.1.10",
    description: "Analiza una IP puntual y genera XML importable.",
  },
  {
    title: "Red local autorizada",
    command: "nmap -sV -oX scan-red.xml 192.168.1.0/24",
    description: "Descubre hosts y servicios dentro de una red propia.",
  },
  {
    title: "Escaneo rápido",
    command: "nmap -F -sV -oX scan-rapido.xml 192.168.1.10",
    description: "Revisa puertos comunes con menor tiempo de ejecución.",
  },
  {
    title: "Puertos concretos",
    command: "nmap -sV -p 22,80,443,8000,8080 -oX scan-puertos.xml 192.168.1.10",
    description: "Limita el análisis a puertos definidos por el usuario.",
  },
  {
    title: "Dominio autorizado",
    command: "nmap -sV -oX scan-dominio.xml ejemplo.com",
    description: "Analiza servicios asociados a un dominio bajo autorización.",
  },
];

const aiProviderIds: Record<string, string> = {
  OpenAI: "openai",
  OpenRouter: "openrouter",
  Ollama: "ollama",
  "LM Studio": "lm_studio",
  Custom: "custom",
};

function buildNmapCommand(form: NmapCommandFormState): string {
  const target = form.target.trim();
  const outputFile = form.outputFile.trim();
  const ports = form.ports.trim();

  if (!target || !outputFile) {
    return "";
  }

  const baseArgs = ["nmap"];

  if (form.scanProfile === "medium") {
    baseArgs.push("-sV", "-O");
  }

  if (form.scanProfile === "complete") {
    baseArgs.push("-sV", "-O", "-A", "--version-all");
  }

  if (form.scanProfile === "fast") {
    baseArgs.push("-F", "-sV");
  }

  if (form.scanProfile === "custom_ports") {
    baseArgs.push("-sV");

    if (ports) {
      baseArgs.push("-p", ports);
    }
  }

  baseArgs.push("-oX", outputFile, target);

  return baseArgs.join(" ");
}

function getNmapTargetPlaceholder(targetKind: NmapTargetKind): string {
  if (targetKind === "localhost") {
    return "127.0.0.1";
  }

  if (targetKind === "network") {
    return "192.168.1.0/24";
  }

  if (targetKind === "domain") {
    return "ejemplo.com";
  }

  return "192.168.1.10";
}

function getAssetLabel(
  assetId: string,
  assets: ExplorationAsset[]
): string {
  const asset = assets.find((item) => item.id === assetId);

  if (!asset) {
    return assetId;
  }

  return `${asset.name} (${asset.kind})`;
}

export default function ExplorationPage() {
  const settings = useCyberMapSettings();
  const [state, setState] = useState<ExplorationPageState>({
    status: "loading",
    assets: [],
    findings: [],
    services: [],
    error: null,
  });

  const [assetForm, setAssetForm] = useState<AssetFormState>(initialAssetForm);
  const [findingForm, setFindingForm] =
    useState<FindingFormState>(initialFindingForm);
  const [isSubmittingAsset, setIsSubmittingAsset] = useState(false);
  const [isSubmittingFinding, setIsSubmittingFinding] = useState(false);
  const [nmapXml, setNmapXml] = useState("");
  const [nmapCommandForm, setNmapCommandForm] =
    useState<NmapCommandFormState>(initialNmapCommandForm);
  const [copiedNmapCommand, setCopiedNmapCommand] = useState(false);
  const [copyNmapCommandError, setCopyNmapCommandError] = useState<
    string | null
  >(null);
  const [nmapImportSummary, setNmapImportSummary] =
    useState<ImportNmapXmlSummary | null>(null);
  const [isImportingNmap, setIsImportingNmap] = useState(false);
  const [nmapScanTarget, setNmapScanTarget] = useState("127.0.0.1");
  const [nmapScanProfile, setNmapScanProfile] = useState<"standard" | "fast">(
    "standard"
  );
  const [nmapScanPorts, setNmapScanPorts] = useState("");
  const [nmapScanAuthorized, setNmapScanAuthorized] = useState(false);
  const [isRunningNmapScan, setIsRunningNmapScan] = useState(false);
  const [nmapScanError, setNmapScanError] = useState<string | null>(null);
  const [selectedNmapFileName, setSelectedNmapFileName] = useState<string | null>(
    null
  );
  const [nmapFileError, setNmapFileError] = useState<string | null>(null);
  const [isReadingNmapFile, setIsReadingNmapFile] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AgentRunResponse | null>(null);
  const [aiAnalysisError, setAiAnalysisError] = useState<string | null>(null);
  const [isRunningAiAnalysis, setIsRunningAiAnalysis] = useState(false);
  const [aiRuns, setAiRuns] = useState<AiRunHistoryItem[]>([]);
  const [aiRunsError, setAiRunsError] = useState<string | null>(null);
  const [isLoadingAiRuns, setIsLoadingAiRuns] = useState(false);
  const [submittingRecommendationIndex, setSubmittingRecommendationIndex] =
    useState<number | null>(null);

  async function loadExplorationData() {
    setState((current) => ({
      status: "loading",
      assets: current.assets,
      findings: current.findings,
      services: current.services,
      error: null,
    }));

    try {
      const [assets, findings, services] = await Promise.all([
        listExplorationAssets(),
        listExplorationFindings(),
        listExplorationServices(),
      ]);

      setState({
        status: "ready",
        assets,
        findings,
        services,
        error: null,
      });
    } catch (error) {
      setState({
        status: "error",
        assets: [],
        findings: [],
        services: [],
        error:
          error instanceof Error
            ? error.message
            : "No se pudo cargar Exploration.",
      });
    }
  }

  async function loadAiRuns() {
    setIsLoadingAiRuns(true);
    setAiRunsError(null);

    try {
      const runs = await listAiRuns();
      setAiRuns(runs);
    } catch (error) {
      setAiRunsError(
        error instanceof Error
          ? error.message
          : "No se pudo cargar el historial IA."
      );
    } finally {
      setIsLoadingAiRuns(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function loadInitialExplorationData() {
      try {
        const [assets, findings, services] = await Promise.all([
          listExplorationAssets(),
          listExplorationFindings(),
          listExplorationServices(),
        ]);

        if (!isMounted) {
          return;
        }

        setState({
          status: "ready",
          assets,
          findings,
          services,
          error: null,
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setState({
          status: "error",
          assets: [],
          findings: [],
          services: [],
          error:
            error instanceof Error
              ? error.message
              : "No se pudo cargar Exploration.",
        });
      }
    }

    async function loadInitialAiRuns() {
      try {
        const runs = await listAiRuns();

        if (!isMounted) {
          return;
        }

        setAiRuns(runs);
        setAiRunsError(null);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setAiRunsError(
          error instanceof Error
            ? error.message
            : "No se pudo cargar el historial IA."
        );
      }
    }

    void loadInitialExplorationData();
    void loadInitialAiRuns();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleCreateAsset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    if (!assetForm.name.trim() || !assetForm.value.trim()) {
      setFormError("Asset requiere nombre y valor técnico.");
      return;
    }

    setIsSubmittingAsset(true);

    try {
      await createExplorationAsset({
        name: assetForm.name.trim(),
        kind: assetForm.kind,
        value: assetForm.value.trim(),
        environment: assetForm.environment,
        criticality: assetForm.criticality,
      });

      setAssetForm(initialAssetForm);
      await loadExplorationData();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "No se pudo crear el asset."
      );
    } finally {
      setIsSubmittingAsset(false);
    }
  }

  async function handleCreateFinding(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    if (!findingForm.title.trim()) {
      setFormError("Finding requiere título.");
      return;
    }

    setIsSubmittingFinding(true);

    try {
      await createExplorationFinding({
        title: findingForm.title.trim(),
        severity: findingForm.severity,
        assetId: findingForm.assetId,
        evidence: findingForm.evidence.trim(),
      });

      setFindingForm(initialFindingForm);
      await loadExplorationData();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "No se pudo crear el finding."
      );
    } finally {
      setIsSubmittingFinding(false);
    }
  }

  async function handleCopyNmapCommand() {
    setCopiedNmapCommand(false);
    setCopyNmapCommandError(null);

    if (!generatedNmapCommand) {
      setCopyNmapCommandError("No hay comando Nmap para copiar.");
      return;
    }

    if (!navigator.clipboard) {
      setCopyNmapCommandError(
        "El portapapeles no está disponible en este navegador."
      );
      return;
    }

    try {
      await navigator.clipboard.writeText(generatedNmapCommand);
      setCopiedNmapCommand(true);
    } catch {
      setCopyNmapCommandError("No se pudo copiar el comando Nmap.");
    }
  }

  async function handleNmapXmlFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    setNmapFileError(null);
    setSelectedNmapFileName(null);
    setNmapImportSummary(null);
    setFormError(null);

    if (!file) {
      return;
    }

    const validationError = validateNmapXmlFile(file);

    if (validationError) {
      setNmapFileError(validationError);
      return;
    }

    setIsReadingNmapFile(true);

    try {
      const content = await file.text();

      if (!content.trim()) {
        setNmapFileError("El archivo XML está vacío.");
        return;
      }

      setNmapXml(content);
      setSelectedNmapFileName(file.name);
    } catch {
      setNmapFileError("No se pudo leer el archivo XML.");
    } finally {
      setIsReadingNmapFile(false);
    }
  }

  async function handleImportNmapXml(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setNmapImportSummary(null);

    if (!nmapXml.trim()) {
      setFormError("Pegá XML de Nmap antes de importar.");
      return;
    }

    setIsImportingNmap(true);

    try {
      const response = await importNmapXml({
        xml: nmapXml.trim(),
      });

      setNmapImportSummary(response.summary);
      setNmapXml("");
      setSelectedNmapFileName(null);
      setNmapFileError(null);
      await loadExplorationData();
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "No se pudo importar el XML de Nmap."
      );
    } finally {
      setIsImportingNmap(false);
    }
  }

  async function handleCreateFindingFromRecommendation(index: number) {
    const recommendation = aiAnalysis?.recommendations[index];

    if (!recommendation || !recommendation.suggestedFinding) {
      return;
    }

    setSubmittingRecommendationIndex(index);

    try {
      await createExplorationFinding({
        title: recommendation.title,
        severity: mapRecommendationSeverityToFinding(recommendation.severity),
        assetId: null,
        evidence: recommendation.rationale,
      });

      await loadExplorationData();
      setFormError(null);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "No se pudo crear el finding desde la recomendación."
      );
    } finally {
      setSubmittingRecommendationIndex(null);
    }
  }

  async function handleRunAiAnalysis() {
    setAiAnalysisError(null);
    setAiAnalysis(null);
    const providerId = aiProviderIds[settings.aiProvider];

    if (!providerId) {
      setAiAnalysisError(
        "El proveedor seleccionado todavía no usa el adaptador compatible. Elegí OpenAI, OpenRouter, Ollama, LM Studio o Custom."
      );
      return;
    }

    setIsRunningAiAnalysis(true);

    try {
      const response = await runAiAgent({
        agentId: "exploration_analyst",
        providerId,
        model: settings.aiModel.trim(),
        task: "Analizar superficie detectada",
        scope: {
          assetIds: [],
          includeAssets: true,
          includeServices: true,
          includeFindings: true,
        },
      });

      setAiAnalysis(response);
      await loadAiRuns();
    } catch (error) {
      setAiAnalysisError(
        error instanceof Error
          ? error.message
          : "No se pudo ejecutar el análisis IA."
      );
    } finally {
      setIsRunningAiAnalysis(false);
    }
  }

  async function handleRunNmapScan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNmapScanError(null);

    if (!nmapScanAuthorized) {
      setNmapScanError("Confirmá que el objetivo está dentro de tu alcance autorizado.");
      return;
    }

    setIsRunningNmapScan(true);

    try {
      const response = await runNmapScan({
        target: nmapScanTarget.trim(),
        profile: nmapScanProfile,
        ports: nmapScanPorts.trim() || undefined,
        authorized: true,
      });

      setNmapImportSummary(response.summary);
      await loadExplorationData();
    } catch (error) {
      setNmapScanError(
        error instanceof Error
          ? error.message
          : "No se pudo ejecutar el escaneo Nmap."
      );
    } finally {
      setIsRunningNmapScan(false);
    }
  }

  const generatedNmapCommand = buildNmapCommand(nmapCommandForm);
  const nmapImportNotice = getNmapImportNotice(nmapImportSummary);
  const isNmapConnectorEnabled =
    settings.connectorEnabled && settings.connectorPreset === "Nmap";

  const isEmpty =
    state.status === "ready" &&
    state.assets.length === 0 &&
    state.findings.length === 0 &&
    state.services.length === 0;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
      <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 shadow-lg">
        <p className="text-sm font-medium uppercase tracking-wide text-cyan-400">
          Exploration
        </p>

        <div className="mt-3 flex flex-col gap-3">
          <h1 className="text-3xl font-semibold text-slate-50">
            Superficie de ataque
          </h1>

          <p className="max-w-3xl text-sm leading-6 text-slate-300">
            Módulo para visualizar y cargar activos y hallazgos iniciales.
            Esta versión usa storage JSON temporal en el backend.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void loadExplorationData()}
            className="rounded-lg border border-cyan-700 bg-cyan-950/40 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-900/60"
          >
            Refrescar datos
          </button>

          <button
            type="button"
            onClick={() => void handleRunAiAnalysis()}
            disabled={
              isRunningAiAnalysis ||
              state.status !== "ready" ||
              !settings.aiModel.trim()
            }
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRunningAiAnalysis ? "Analizando..." : "Analizar con IA"}
          </button>
        </div>
      </section>

      {formError ? (
        <section className="rounded-2xl border border-red-900/70 bg-red-950/30 p-4 text-sm text-red-100">
          {formError}
        </section>
      ) : null}

      {aiAnalysisError ? (
        <section className="rounded-2xl border border-red-900/70 bg-red-950/30 p-4 text-sm text-red-100">
          {aiAnalysisError}
        </section>
      ) : null}

      {aiAnalysis ? (
        <section className="rounded-2xl border border-violet-900/70 bg-violet-950/30 p-6">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium uppercase tracking-wide text-violet-300">
              IA
            </p>
            <h2 className="text-xl font-semibold text-slate-50">
              Análisis de superficie
            </h2>
            <p className="text-sm leading-6 text-slate-200">
              {aiAnalysis.summary}
            </p>
          </div>

          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-lg bg-slate-950/60 p-3">
              <dt className="text-slate-400">Assets usados</dt>
              <dd className="mt-1 text-2xl font-semibold text-slate-50">
                {aiAnalysis.evidenceUsed.assets}
              </dd>
            </div>

            <div className="rounded-lg bg-slate-950/60 p-3">
              <dt className="text-slate-400">Servicios usados</dt>
              <dd className="mt-1 text-2xl font-semibold text-slate-50">
                {aiAnalysis.evidenceUsed.services}
              </dd>
            </div>

            <div className="rounded-lg bg-slate-950/60 p-3">
              <dt className="text-slate-400">Findings usados</dt>
              <dd className="mt-1 text-2xl font-semibold text-slate-50">
                {aiAnalysis.evidenceUsed.findings}
              </dd>
            </div>
          </dl>

          <div className="mt-4 grid gap-3">
            {aiAnalysis.recommendations.map((recommendation, index) => (
              <article
                key={`${recommendation.title}-${recommendation.severity}`}
                className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h3 className="font-medium text-slate-100">
                    {recommendation.title}
                  </h3>
                  <span className="rounded-full bg-violet-900/70 px-3 py-1 text-xs text-violet-100">
                    {recommendation.severity}
                  </span>
                </div>

                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {recommendation.rationale}
                </p>

                {recommendation.suggestedFinding ? (
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs uppercase tracking-wide text-violet-300">
                      Sugerido como finding
                    </p>
                    <button
                      type="button"
                      onClick={() => void handleCreateFindingFromRecommendation(index)}
                      disabled={submittingRecommendationIndex === index}
                      className="rounded-lg bg-violet-600 px-3 py-1 text-xs font-medium text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submittingRecommendationIndex === index
                        ? "Creando..."
                        : "Crear finding"}
                    </button>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-violet-300">
              Historial IA
            </p>
            <h2 className="mt-1 text-xl font-semibold text-slate-50">
              Ejecuciones recientes
            </h2>
          </div>

          <button
            type="button"
            onClick={() => void loadAiRuns()}
            disabled={isLoadingAiRuns}
            className="rounded-lg border border-violet-700 bg-violet-950/40 px-4 py-2 text-sm font-medium text-violet-100 transition hover:bg-violet-900/60 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoadingAiRuns ? "Cargando..." : "Refrescar historial"}
          </button>
        </div>

        {aiRunsError ? (
          <p className="mt-4 rounded-lg border border-red-900/70 bg-red-950/30 p-3 text-sm text-red-100">
            {aiRunsError}
          </p>
        ) : null}

        {aiRuns.length === 0 && !aiRunsError ? (
          <p className="mt-4 text-sm text-slate-400">
            Todavía no hay ejecuciones IA persistidas. Ejecutá un análisis para
            crear el primer registro de auditoría.
          </p>
        ) : null}

        {aiRuns.length > 0 ? (
          <div className="mt-4 grid gap-3">
            {aiRuns.slice(0, 5).map((run) => (
              <article
                key={run.id}
                className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-medium text-slate-100">{run.task}</h3>
                    <p className="mt-1 text-xs text-slate-400">
                      {run.agentId} · {run.providerId} · {run.model}
                    </p>
                  </div>

                  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                    {run.status}
                  </span>
                </div>

                <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-4">
                  <div className="rounded-lg bg-slate-950/60 p-3">
                    <dt className="text-slate-400">Assets</dt>
                    <dd className="mt-1 text-lg font-semibold text-slate-50">
                      {run.evidenceUsed.assets}
                    </dd>
                  </div>

                  <div className="rounded-lg bg-slate-950/60 p-3">
                    <dt className="text-slate-400">Servicios</dt>
                    <dd className="mt-1 text-lg font-semibold text-slate-50">
                      {run.evidenceUsed.services}
                    </dd>
                  </div>

                  <div className="rounded-lg bg-slate-950/60 p-3">
                    <dt className="text-slate-400">Findings</dt>
                    <dd className="mt-1 text-lg font-semibold text-slate-50">
                      {run.evidenceUsed.findings}
                    </dd>
                  </div>

                  <div className="rounded-lg bg-slate-950/60 p-3">
                    <dt className="text-slate-400">Recomendaciones</dt>
                    <dd className="mt-1 text-lg font-semibold text-slate-50">
                      {run.recommendations.length}
                    </dd>
                  </div>
                </dl>

                <p className="mt-3 text-xs text-slate-500">
                  Run: {run.id} · Creado:{" "}
                  {new Date(run.createdAt).toLocaleString()}
                </p>
              </article>
            ))}
          </div>
        ) : null}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <form
          onSubmit={handleCreateAsset}
          className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6"
        >
          <h2 className="text-xl font-semibold text-slate-50">Crear Asset</h2>

          <div className="mt-4 grid gap-4">
            <label className="grid gap-2 text-sm text-slate-300">
              Nombre
              <input
                value={assetForm.name}
                onChange={(event) =>
                  setAssetForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-cyan-500"
                placeholder="Localhost"
              />
            </label>

            <label className="grid gap-2 text-sm text-slate-300">
              Valor técnico
              <input
                value={assetForm.value}
                onChange={(event) =>
                  setAssetForm((current) => ({
                    ...current,
                    value: event.target.value,
                  }))
                }
                className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-cyan-500"
                placeholder="localhost"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="grid gap-2 text-sm text-slate-300">
                Tipo
                <select
                  value={assetForm.kind}
                  onChange={(event) =>
                    setAssetForm((current) => ({
                      ...current,
                      kind: event.target.value as AssetKind,
                    }))
                  }
                  className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-cyan-500"
                >
                  <option value="host">host</option>
                  <option value="ip">ip</option>
                  <option value="domain">domain</option>
                  <option value="url">url</option>
                  <option value="service">service</option>
                </select>
              </label>

              <label className="grid gap-2 text-sm text-slate-300">
                Entorno
                <select
                  value={assetForm.environment}
                  onChange={(event) =>
                    setAssetForm((current) => ({
                      ...current,
                      environment: event.target.value as AssetEnvironment,
                    }))
                  }
                  className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-cyan-500"
                >
                  <option value="unknown">unknown</option>
                  <option value="dev">dev</option>
                  <option value="staging">staging</option>
                  <option value="prod">prod</option>
                </select>
              </label>

              <label className="grid gap-2 text-sm text-slate-300">
                Criticidad
                <select
                  value={assetForm.criticality}
                  onChange={(event) =>
                    setAssetForm((current) => ({
                      ...current,
                      criticality: event.target.value as AssetCriticality,
                    }))
                  }
                  className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-cyan-500"
                >
                  <option value="low">low</option>
                  <option value="medium">medium</option>
                  <option value="high">high</option>
                  <option value="critical">critical</option>
                </select>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmittingAsset}
              className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmittingAsset ? "Creando..." : "Crear Asset"}
            </button>
          </div>
        </form>

        <form
          onSubmit={handleCreateFinding}
          className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6"
        >
          <h2 className="text-xl font-semibold text-slate-50">
            Crear Finding
          </h2>

          <div className="mt-4 grid gap-4">
            <label className="grid gap-2 text-sm text-slate-300">
              Título
              <input
                value={findingForm.title}
                onChange={(event) =>
                  setFindingForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-cyan-500"
                placeholder="Puerto expuesto"
              />
            </label>

            <label className="grid gap-2 text-sm text-slate-300">
              Severidad
              <select
                value={findingForm.severity}
                onChange={(event) =>
                  setFindingForm((current) => ({
                    ...current,
                    severity: event.target.value as FindingSeverity,
                  }))
                }
                className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-cyan-500"
              >
                <option value="info">info</option>
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
                <option value="critical">critical</option>
              </select>
            </label>

            <label className="grid gap-2 text-sm text-slate-300">
              Asset asociado
              <select
                value={findingForm.assetId ?? ""}
                onChange={(event) =>
                  setFindingForm((current) => ({
                    ...current,
                    assetId: event.target.value ? event.target.value : null,
                  }))
                }
                className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-cyan-500"
              >
                <option value="">Sin asset asociado</option>
                {state.assets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.name} ({asset.kind})
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm text-slate-300">
              Evidencia
              <textarea
                value={findingForm.evidence}
                onChange={(event) =>
                  setFindingForm((current) => ({
                    ...current,
                    evidence: event.target.value,
                  }))
                }
                className="min-h-24 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-cyan-500"
                placeholder="Evidencia observada"
              />
            </label>

            <button
              type="submit"
              disabled={isSubmittingFinding}
              className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmittingFinding ? "Creando..." : "Crear Finding"}
            </button>
          </div>
        </form>
      </section>

      <form
        onSubmit={handleImportNmapXml}
        className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6"
      >
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium uppercase tracking-wide text-cyan-400">
            Importación
          </p>
          <h2 className="text-xl font-semibold text-slate-50">
            Importar XML de Nmap
          </h2>
          <p className="max-w-3xl text-sm leading-6 text-slate-300">
            Podés importar XML generado externamente o ejecutar un perfil local
            acotado mediante el conector Nmap, con alcance autorizado.
          </p>
        </div>

        <section className="mt-5 rounded-xl border border-emerald-900/60 bg-emerald-950/20 p-4">
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-300">
              Escaneo local con conector Nmap
            </h3>
            <p className="text-sm leading-6 text-slate-300">
              El resultado XML se importa automáticamente. El backend solo
              admite direcciones IP dentro de <code>CYBERMAP_NMAP_ALLOWED_NETWORKS</code>;
              por defecto, únicamente loopback.
            </p>
            {!isNmapConnectorEnabled ? (
              <p className="rounded-lg border border-amber-900/70 bg-amber-950/30 p-3 text-sm text-amber-100">
                Activá el conector y seleccioná Nmap en Settings para ejecutar
                escaneos desde esta pantalla.
              </p>
            ) : null}
          </div>

          <form className="mt-4 grid gap-4 lg:grid-cols-2" onSubmit={handleRunNmapScan}>
            <label className="grid gap-2 text-sm text-slate-300">
              Dirección IP autorizada
              <input
                value={nmapScanTarget}
                onChange={(event) => setNmapScanTarget(event.target.value)}
                disabled={!isNmapConnectorEnabled || isRunningNmapScan}
                placeholder="127.0.0.1"
                className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </label>

            <label className="grid gap-2 text-sm text-slate-300">
              Perfil
              <select
                value={nmapScanProfile}
                onChange={(event) =>
                  setNmapScanProfile(event.target.value as "standard" | "fast")
                }
                disabled={!isNmapConnectorEnabled || isRunningNmapScan}
                className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="standard">Estándar: detección de servicios</option>
                <option value="fast">Rápido: puertos frecuentes</option>
              </select>
            </label>

            <label className="grid gap-2 text-sm text-slate-300">
              Puertos opcionales
              <input
                value={nmapScanPorts}
                onChange={(event) => setNmapScanPorts(event.target.value)}
                disabled={!isNmapConnectorEnabled || isRunningNmapScan}
                placeholder="22,80,443"
                className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </label>

            <label className="flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={nmapScanAuthorized}
                onChange={(event) => setNmapScanAuthorized(event.target.checked)}
                disabled={!isNmapConnectorEnabled || isRunningNmapScan}
                className="mt-0.5 h-4 w-4 accent-cyan-400"
              />
              Confirmo que tengo autorización explícita para escanear este objetivo.
            </label>

            <button
              type="submit"
              disabled={!isNmapConnectorEnabled || isRunningNmapScan}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60 lg:col-span-2"
            >
              {isRunningNmapScan ? "Ejecutando escaneo..." : "Ejecutar e importar Nmap"}
            </button>
          </form>

          {nmapScanError ? (
            <p className="mt-4 rounded-lg border border-red-900/70 bg-red-950/30 p-3 text-sm text-red-100">
              {nmapScanError}
            </p>
          ) : null}
        </section>

        <section className="mt-5 rounded-xl border border-cyan-900/60 bg-cyan-950/20 p-4">
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-cyan-300">
              Comandos sugeridos para generar XML
            </h3>
            <p className="text-sm leading-6 text-slate-300">
              Ejecutá estos comandos en tu terminal, abrí el archivo XML
              generado y pegá su contenido en el formulario de importación.
            </p>
            <p className="rounded-lg border border-amber-900/70 bg-amber-950/30 p-3 text-sm leading-6 text-amber-100">
              Usá estos comandos solo sobre sistemas propios o sobre objetivos
              donde tengas autorización explícita. Para un escaneo gestionado,
              usá el conector acotado que está arriba.
            </p>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {nmapCommandPresets.map((preset) => (
              <article
                key={preset.title}
                className="rounded-lg border border-slate-800 bg-slate-950/60 p-4"
              >
                <h4 className="font-medium text-slate-100">{preset.title}</h4>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  {preset.description}
                </p>
                <pre className="mt-3 overflow-x-auto rounded-lg border border-slate-800 bg-slate-900 p-3 text-xs text-cyan-100">
                  <code>{preset.command}</code>
                </pre>
              </article>
            ))}
          </div>

          <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-cyan-300">
                Generador asistido de comando
              </h3>
              <p className="text-sm leading-6 text-slate-300">
                Completá los campos y CyberMap generará un comando Nmap para
                ejecutar manualmente en tu terminal. No se ejecuta ningún
                escaneo desde la aplicación.
              </p>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <label className="grid gap-2 text-sm text-slate-300">
                Tipo de objetivo
                <select
                  value={nmapCommandForm.targetKind}
                  onChange={(event) => {
                    const targetKind = event.target.value as NmapTargetKind;

                    setCopiedNmapCommand(false);
                    setCopyNmapCommandError(null);
                    setNmapCommandForm((current) => ({
                      ...current,
                      targetKind,
                      target: getNmapTargetPlaceholder(targetKind),
                    }));
                  }}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-cyan-500"
                >
                  <option value="localhost">localhost</option>
                  <option value="ip">ip</option>
                  <option value="network">red</option>
                  <option value="domain">dominio</option>
                </select>
              </label>

              <label className="grid gap-2 text-sm text-slate-300">
                Objetivo
                <input
                  value={nmapCommandForm.target}
                  onChange={(event) => {
                    setCopiedNmapCommand(false);
                    setCopyNmapCommandError(null);
                    setNmapCommandForm((current) => ({
                      ...current,
                      target: event.target.value,
                    }));
                  }}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-cyan-500"
                  placeholder={getNmapTargetPlaceholder(
                    nmapCommandForm.targetKind
                  )}
                />
              </label>

              <label className="grid gap-2 text-sm text-slate-300">
                Perfil
                <select
                  value={nmapCommandForm.scanProfile}
                  onChange={(event) => {
                    setCopiedNmapCommand(false);
                    setCopyNmapCommandError(null);
                    setNmapCommandForm((current) => ({
                      ...current,
                      scanProfile: event.target.value as NmapScanProfile,
                    }));
                  }}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-cyan-500"
                >
                  <option value="basic">básico</option>
                  <option value="medium">medio: versiones + SO</option>
                  <option value="complete">completo: profundo</option>
                  <option value="fast">rápido</option>
                  <option value="custom_ports">puertos concretos</option>
                </select>
              </label>

              <label className="grid gap-2 text-sm text-slate-300">
                Archivo XML
                <input
                  value={nmapCommandForm.outputFile}
                  onChange={(event) => {
                    setCopiedNmapCommand(false);
                    setCopyNmapCommandError(null);
                    setNmapCommandForm((current) => ({
                      ...current,
                      outputFile: event.target.value,
                    }));
                  }}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-cyan-500"
                  placeholder="scan.xml"
                />
              </label>

              {nmapCommandForm.scanProfile === "custom_ports" ? (
                <label className="grid gap-2 text-sm text-slate-300 lg:col-span-2">
                  Puertos
                  <input
                    value={nmapCommandForm.ports}
                    onChange={(event) => {
                      setCopiedNmapCommand(false);
                      setCopyNmapCommandError(null);
                      setNmapCommandForm((current) => ({
                        ...current,
                        ports: event.target.value,
                      }));
                    }}
                    className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-cyan-500"
                    placeholder="22,80,443,8000,8080"
                  />
                </label>
              ) : null}
            </div>

            <div className="mt-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-medium text-slate-300">
                  Comando generado
                </p>

                <button
                  type="button"
                  onClick={() => void handleCopyNmapCommand()}
                  disabled={!generatedNmapCommand}
                  className="rounded-lg border border-cyan-700 bg-cyan-950/40 px-3 py-2 text-xs font-medium text-cyan-100 transition hover:bg-cyan-900/60 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {copiedNmapCommand ? "Comando copiado" : "Copiar comando"}
                </button>
              </div>

              {generatedNmapCommand ? (
                <pre className="mt-2 overflow-x-auto rounded-lg border border-slate-800 bg-slate-900 p-3 text-xs text-cyan-100">
                  <code>{generatedNmapCommand}</code>
                </pre>
              ) : (
                <p className="mt-2 rounded-lg border border-amber-900/70 bg-amber-950/30 p-3 text-sm text-amber-100">
                  Completá objetivo y archivo XML para generar el comando.
                </p>
              )}

              {copyNmapCommandError ? (
                <p className="mt-2 rounded-lg border border-red-900/70 bg-red-950/30 p-3 text-sm text-red-100">
                  {copyNmapCommandError}
                </p>
              ) : null}
            </div>
          </div>
        </section>

        <div className="mt-4 grid gap-4">
          <div className="grid gap-2 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <label className="text-sm font-medium text-slate-300" htmlFor="nmap-xml-file">
              Seleccionar archivo XML
            </label>
            <input
              id="nmap-xml-file"
              type="file"
              accept=".xml,text/xml,application/xml"
              onChange={(event) => void handleNmapXmlFileChange(event)}
              className="block w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 file:mr-3 file:rounded-md file:border-0 file:bg-cyan-600 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-cyan-500"
            />
            <p className="text-xs leading-6 text-slate-400">
              Tamaño máximo: {MAX_NMAP_XML_FILE_BYTES / (1024 * 1024)} MB. También podés pegar manualmente el contenido XML en el textarea.
            </p>
            {isReadingNmapFile ? (
              <p className="text-sm text-cyan-300">Leyendo archivo XML…</p>
            ) : null}
            {selectedNmapFileName ? (
              <p className="text-sm text-emerald-300">
                Archivo cargado: {selectedNmapFileName}
              </p>
            ) : null}
            {nmapFileError ? (
              <p className="rounded-lg border border-red-900/70 bg-red-950/30 p-3 text-sm text-red-100">
                {nmapFileError}
              </p>
            ) : null}
          </div>

          <label className="grid gap-2 text-sm text-slate-300">
            XML de Nmap
            <textarea
              value={nmapXml}
              onChange={(event) => {
                setNmapXml(event.target.value);
                setNmapImportSummary(null);
              }}
              className="min-h-56 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 font-mono text-sm text-slate-100 outline-none focus:border-cyan-500"
              placeholder="<nmaprun>...</nmaprun>"
            />
          </label>

          <button
            type="submit"
            disabled={isImportingNmap}
            className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isImportingNmap ? "Importando..." : "Importar XML Nmap"}
          </button>

          {nmapImportSummary ? (
            <section className="rounded-xl border border-emerald-900/70 bg-emerald-950/30 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-300">
                Resumen de importación
              </h3>

              {nmapImportNotice ? (
                <p className="mt-3 rounded-lg border border-amber-900/70 bg-amber-950/30 p-3 text-sm leading-6 text-amber-100">
                  {nmapImportNotice}
                </p>
              ) : null}

              <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-6">
                <div className="rounded-lg bg-slate-950/60 p-3">
                  <dt className="text-slate-400">Assets creados</dt>
                  <dd className="mt-1 text-2xl font-semibold text-slate-50">
                    {nmapImportSummary.assetsCreated}
                  </dd>
                </div>

                <div className="rounded-lg bg-slate-950/60 p-3">
                  <dt className="text-slate-400">Assets omitidos</dt>
                  <dd className="mt-1 text-2xl font-semibold text-slate-50">
                    {nmapImportSummary.assetsSkipped}
                  </dd>
                </div>

                <div className="rounded-lg bg-slate-950/60 p-3">
                  <dt className="text-slate-400">Servicios creados</dt>
                  <dd className="mt-1 text-2xl font-semibold text-slate-50">
                    {nmapImportSummary.servicesCreated}
                  </dd>
                </div>

                <div className="rounded-lg bg-slate-950/60 p-3">
                  <dt className="text-slate-400">Servicios omitidos</dt>
                  <dd className="mt-1 text-2xl font-semibold text-slate-50">
                    {nmapImportSummary.servicesSkipped}
                  </dd>
                </div>

                <div className="rounded-lg bg-slate-950/60 p-3">
                  <dt className="text-slate-400">Hosts vistos</dt>
                  <dd className="mt-1 text-2xl font-semibold text-slate-50">
                    {nmapImportSummary.hostsSeen}
                  </dd>
                </div>

                <div className="rounded-lg bg-slate-950/60 p-3">
                  <dt className="text-slate-400">Puertos abiertos</dt>
                  <dd className="mt-1 text-2xl font-semibold text-slate-50">
                    {nmapImportSummary.openPortsSeen}
                  </dd>
                </div>
              </dl>

              {nmapImportSummary.warnings.length > 0 ? (
                <div className="mt-4 rounded-lg border border-amber-900/70 bg-amber-950/30 p-3">
                  <p className="text-sm font-medium text-amber-200">
                    Advertencias
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-100">
                    {nmapImportSummary.warnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </section>
          ) : null}
        </div>
      </form>

      {state.status === "loading" ? (
        <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 text-slate-300">
          Cargando datos de Exploration...
        </section>
      ) : null}

      {state.status === "error" ? (
        <section className="rounded-2xl border border-red-900/70 bg-red-950/30 p-6">
          <h2 className="text-lg font-semibold text-red-200">
            No se pudo cargar Exploration
          </h2>
          <p className="mt-2 text-sm text-red-100">{state.error}</p>
        </section>
      ) : null}

      {isEmpty ? (
        <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
          <h2 className="text-lg font-semibold text-slate-100">
            Todavía no hay datos
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            Creá assets o findings desde los formularios para empezar a poblar
            esta vista.
          </p>
        </section>
      ) : null}

      {state.status === "ready" && !isEmpty ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-slate-50">Assets</h2>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                {state.assets.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase text-slate-400">
                  <tr>
                    <th className="py-2 pr-4">Nombre</th>
                    <th className="py-2 pr-4">Tipo</th>
                    <th className="py-2 pr-4">Valor</th>
                    <th className="py-2 pr-4">Criticidad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {state.assets.map((asset) => (
                    <tr key={asset.id}>
                      <td className="py-3 pr-4 font-medium">{asset.name}</td>
                      <td className="py-3 pr-4">{asset.kind}</td>
                      <td className="py-3 pr-4">{asset.value}</td>
                      <td className="py-3 pr-4">{asset.criticality}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-slate-50">
                Servicios detectados
              </h2>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                {state.services.length}
              </span>
            </div>

            {state.services.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs uppercase text-slate-400">
                    <tr>
                      <th className="py-2 pr-4">Asset</th>
                      <th className="py-2 pr-4">Protocolo</th>
                      <th className="py-2 pr-4">Puerto</th>
                      <th className="py-2 pr-4">Servicio</th>
                      <th className="py-2 pr-4">Producto</th>
                      <th className="py-2 pr-4">Versión</th>
                      <th className="py-2 pr-4">Estado</th>
                      <th className="py-2 pr-4">Fuente</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200">
                    {state.services.map((service) => (
                      <tr key={service.id}>
                        <td className="py-3 pr-4">
                          {getAssetLabel(service.assetId, state.assets)}
                        </td>
                        <td className="py-3 pr-4">{service.protocol}</td>
                        <td className="py-3 pr-4">{service.port}</td>
                        <td className="py-3 pr-4">{service.name ?? "-"}</td>
                        <td className="py-3 pr-4">{service.product ?? "-"}</td>
                        <td className="py-3 pr-4">{service.version ?? "-"}</td>
                        <td className="py-3 pr-4">{service.state}</td>
                        <td className="py-3 pr-4">{service.source}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-slate-400">
                Todavía no hay servicios detectados. Importá un XML de Nmap con
                puertos abiertos para poblar esta tabla.
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-slate-50">Findings</h2>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                {state.findings.length}
              </span>
            </div>

            <div className="space-y-3">
              {state.findings.map((finding) => (
                <article
                  key={finding.id}
                  className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-medium text-slate-100">
                      {finding.title}
                    </h3>
                    <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                      {finding.severity}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-slate-300">
                    Estado: {finding.status}
                  </p>

                  {finding.assetId ? (
                    <p className="mt-2 text-sm text-slate-400">
                      Asset asociado: {getAssetLabel(finding.assetId, state.assets)}
                    </p>
                  ) : null}

                  {finding.evidence ? (
                    <p className="mt-2 text-sm text-slate-400">
                      Evidencia: {finding.evidence}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
