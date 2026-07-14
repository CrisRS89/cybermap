import { AppSidebar } from "@/components/app-sidebar";
import { AppTopbar } from "@/components/app-topbar";
import { MobileNav } from "@/components/mobile-nav";
import { DashboardContent } from "@/components/dashboard-content";

export default function Home() {
  return (
    <main className="min-h-screen text-slate-100">
      <MobileNav />

      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <AppSidebar />

        <section className="flex min-w-0 flex-col">
          <AppTopbar />

          <DashboardContent />
        </section>
      </div>
    </main>
  );
}
