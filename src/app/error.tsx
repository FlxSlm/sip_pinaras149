"use client";

import Link from "next/link";
import { Button, Card, Notice, buttonClassName } from "@/components/ui/primitives";

export default function ErrorPage({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <main className="grid min-h-dvh place-items-center px-5 py-12">
      <Card className="w-full max-w-lg p-6 sm:p-8">
        <h1 className="text-2xl font-semibold">Halaman belum dapat dimuat</h1>
        <Notice tone="error" className="mt-4">Terjadi kendala saat memuat informasi. Silakan coba kembali beberapa saat lagi.</Notice>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={retry}>Coba kembali</Button>
          <Link href="/" className={buttonClassName("secondary")}>Ke beranda</Link>
        </div>
      </Card>
    </main>
  );
}
