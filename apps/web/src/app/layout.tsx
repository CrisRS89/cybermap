import type { Metadata } from "next";
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
      <body>{children}</body>
    </html>
  );
}
