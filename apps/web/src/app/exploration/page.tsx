"use client";

import { useEffect, useState } from "react";

import {
  listExplorationAssets,
  listExplorationFindings,
} from "@/features/exploration/exploration-api";
import type {
  ExplorationAsset,
  ExplorationFinding,
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

export default function ExplorationPage() {
  const [state, setState] = useState<ExplorationPageState>({
    status: "loading",
    assets: [],
    findings: [],
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    async function loadExplorationData() {
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

    void loadExplorationData();

    return () => {
      isMounted = false;
    };
  }, []);

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
            Módulo para visualizar activos y hallazgos iniciales cargados desde
            el backend de CyberMap. Esta versión usa storage JSON temporal y
            prepara la futura migración a SQLite.
          </p>
        </div>
      </section>

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
            Creá assets o findings desde la API para empezar a poblar esta
            vista.
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
