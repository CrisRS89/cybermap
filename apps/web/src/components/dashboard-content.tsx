"use client";

import { useEffect, useState } from "react";
import { MetricCard } from "@/components/metric-card";
import { AttackSurfacePanel } from "@/components/attack-surface-panel";
import { RecentEvents } from "@/components/recent-events";
import { StatusPanel } from "@/components/status-panel";
import { metricCards } from "@/data/dashboard-data";
import {
  listExplorationAssets,
  listExplorationFindings,
  listExplorationServices,
} from "@/features/exploration/exploration-api";
import { useCyberMapSettings } from "@/features/settings/use-cybermap-settings";
import { useI18n } from "@/lib/useI18n";

const metricTranslationKeys = [
  "assetsDetected",
  "openPorts",
  "vulnerabilities",
  "aiActive",
];

export function DashboardContent() {
  const { t } = useI18n();
  const settings = useCyberMapSettings();
  const [explorationCounts, setExplorationCounts] = useState({
    assets: 0,
    services: 0,
    findings: 0,
  });

  useEffect(() => {
    let active = true;

    void Promise.all([
      listExplorationAssets(),
      listExplorationServices(),
      listExplorationFindings(),
    ])
      .then(([assets, services, findings]) => {
        if (active) {
          setExplorationCounts({
            assets: assets.length,
            services: services.length,
            findings: findings.length,
          });
        }
      })
      .catch(() => {
        // El dashboard conserva valores iniciales si la API no está disponible.
      });

    return () => {
      active = false;
    };
  }, []);

  const metricValues = [
    String(explorationCounts.assets),
    String(explorationCounts.services),
    String(explorationCounts.findings),
    settings.aiModel ? settings.aiProvider : "No configurada",
  ];

  return (
    <div className="grid flex-1 gap-6 p-4 sm:p-6 xl:grid-cols-[1fr_340px] xl:p-8">
      <div className="space-y-6">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metricCards.map((card, index) => {
            const translationKey = metricTranslationKeys[index];

            return (
              <MetricCard
                key={card.label}
                label={t(`dashboard.metrics.${translationKey}`, card.label)}
                value={metricValues[index] ?? card.value}
                detail={t(
                  `dashboard.metrics.${translationKey}Hint`,
                  card.detail
                )}
              />
            );
          })}
        </section>

        <AttackSurfacePanel />
        <RecentEvents />
      </div>

      <StatusPanel />
    </div>
  );
}
