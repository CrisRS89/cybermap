import { AppSidebar } from "@/components/app-sidebar";
import { AppTopbar } from "@/components/app-topbar";
import { AttackSurfacePanel } from "@/components/attack-surface-panel";
import { MetricCard } from "@/components/metric-card";
import { MobileNav } from "@/components/mobile-nav";
import { RecentEvents } from "@/components/recent-events";
import { StatusPanel } from "@/components/status-panel";
import { metricCards } from "@/data/dashboard-data";

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#14313a_0,#091116_38%,#05080c_100%)] text-slate-100">
      <MobileNav />

      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <AppSidebar />

        <section className="flex min-w-0 flex-col">
          <AppTopbar />

          <div className="grid flex-1 gap-6 p-4 sm:p-6 xl:grid-cols-[1fr_340px] xl:p-8">
            <div className="space-y-6">
              <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {metricCards.map((card) => (
                  <MetricCard
                    key={card.label}
                    label={card.label}
                    value={card.value}
                    detail={card.detail}
                  />
                ))}
              </section>

              <AttackSurfacePanel />
              <RecentEvents />
            </div>

            <StatusPanel />
          </div>
        </section>
      </div>
    </main>
  );
}
