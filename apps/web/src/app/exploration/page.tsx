"use client";

import { FormEvent, useEffect, useState } from "react";

import {
  createExplorationAsset,
  createExplorationFinding,
  listExplorationAssets,
  listExplorationFindings,
} from "@/features/exploration/exploration-api";
import {
  importNmapXml,
  type ImportNmapXmlSummary,
} from "@/features/exploration/exploration-imports-api";
import type {
  AssetCriticality,
  AssetEnvironment,
  AssetKind,
  ExplorationAsset,
  ExplorationFinding,
  FindingSeverity,
} from "@/features/exploration/exploration-types";

type ExplorationPageState =
  | {
      status: "loading";
      assets: ExplorationAsset[];
      findings: ExplorationFinding[];
      error: null;
    }
  | {
      status: "ready";
      assets: ExplorationAsset[];
      findings: ExplorationFinding[];
      error: null;
    }
  | {
      status: "error";
      assets: ExplorationAsset[];
      findings: ExplorationFinding[];
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
  const [state, setState] = useState<ExplorationPageState>({
    status: "loading",
    assets: [],
    findings: [],
    error: null,
  });

  const [assetForm, setAssetForm] = useState<AssetFormState>(initialAssetForm);
  const [findingForm, setFindingForm] =
    useState<FindingFormState>(initialFindingForm);
  const [isSubmittingAsset, setIsSubmittingAsset] = useState(false);
  const [isSubmittingFinding, setIsSubmittingFinding] = useState(false);
  const [nmapXml, setNmapXml] = useState("");
  const [nmapImportSummary, setNmapImportSummary] =
    useState<ImportNmapXmlSummary | null>(null);
  const [isImportingNmap, setIsImportingNmap] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function loadExplorationData() {
    setState((current) => ({
      status: "loading",
      assets: current.assets,
      findings: current.findings,
      error: null,
    }));

    try {
      const [assets, findings] = await Promise.all([
        listExplorationAssets(),
        listExplorationFindings(),
      ]);

      setState({
        status: "ready",
        assets,
        findings,
        error: null,
      });
    } catch (error) {
      setState({
        status: "error",
        assets: [],
        findings: [],
        error:
          error instanceof Error
            ? error.message
            : "No se pudo cargar Exploration.",
      });
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function loadInitialExplorationData() {
      try {
        const [assets, findings] = await Promise.all([
          listExplorationAssets(),
          listExplorationFindings(),
        ]);

        if (!isMounted) {
          return;
        }

        setState({
          status: "ready",
          assets,
          findings,
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
          error:
            error instanceof Error
              ? error.message
              : "No se pudo cargar Exploration.",
        });
      }
    }

    void loadInitialExplorationData();

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

  const isEmpty =
    state.status === "ready" &&
    state.assets.length === 0 &&
    state.findings.length === 0;

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

        <div className="mt-5">
          <button
            type="button"
            onClick={() => void loadExplorationData()}
            className="rounded-lg border border-cyan-700 bg-cyan-950/40 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-900/60"
          >
            Refrescar datos
          </button>
        </div>
      </section>

      {formError ? (
        <section className="rounded-2xl border border-red-900/70 bg-red-950/30 p-4 text-sm text-red-100">
          {formError}
        </section>
      ) : null}

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
            Pegá una salida XML generada por Nmap. CyberMap no ejecuta Nmap,
            no descarga URLs y no lee rutas locales; solo procesa el XML pegado.
          </p>
        </div>

        <div className="mt-4 grid gap-4">
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

              <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
                <div className="rounded-lg bg-slate-950/60 p-3">
                  <dt className="text-slate-400">Assets creados</dt>
                  <dd className="mt-1 text-2xl font-semibold text-slate-50">
                    {nmapImportSummary.assetsCreated}
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
