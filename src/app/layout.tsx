import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import "./globals.css";

export const metadata: Metadata = {
  title: "SIPP",
  description: "Sistem Informasi Peduli Pinaras",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/images/logo tomohon.png", apple: "/images/logo tomohon.png" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full"><ServiceWorkerRegister />{children}</body>
    </html>
  );
}
