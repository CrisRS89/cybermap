import type { Metadata } from "next";
import { AppThemeShell } from "@/components/layout/app-theme-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "CyberMap",
  description:
    "CyberMap - Plataforma modular de ciberseguridad asistida por IA.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <AppThemeShell>{children}</AppThemeShell>
      </body>
    </html>
  );
}
