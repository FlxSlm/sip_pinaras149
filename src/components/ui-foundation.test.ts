import { jsx } from "react/jsx-runtime";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { DashboardShell } from "./dashboard-shell";
import { PublicHeader } from "./public-header";
import { ConfirmDialog } from "./confirm-dialog";
import { TextPromptDialog } from "./text-prompt-dialog";
import { StatusBadge } from "./status-badge";
import { Button, LoadingState, Notice } from "./ui/primitives";

const navigation = vi.hoisted(() => ({ pathname: "/warga" }));
vi.mock("next/navigation", () => ({ usePathname: () => navigation.pathname }));

describe("dashboard presentation boundaries", () => {
  it("keeps public navigation and an accessible mobile menu available", () => {
    navigation.pathname = "/";
    const html = renderToStaticMarkup(jsx(PublicHeader, {}));
    for (const href of ["/", "/#profil", "/#potensi", "/#layanan", "/pengumuman", "/pengaduan", "/login"]) {
      expect(html).toContain(`href="${href}"`);
    }
    expect(html).toContain('aria-label="Buka navigasi"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('href="#public-content"');
    expect(html).not.toContain('href="/admin');
  });

  it("keeps warga routes available without exposing admin navigation", () => {
    navigation.pathname = "/warga/pengaduan/buat";
    const html = renderToStaticMarkup(jsx(DashboardShell, { role: "warga", userName: "Warga Uji", children: "Konten sintetis" }));
    for (const href of ["/warga", "/warga/pengaduan", "/warga/pengaduan/buat", "/warga/notifikasi", "/warga/profil"]) {
      expect(html).toContain(`href="${href}"`);
    }
    expect(html).not.toContain('href="/admin');
    expect(html.match(/<a[^>]*href="\/warga\/pengaduan\/buat"[^>]*>/)?.[0]).toContain('aria-current="page"');
    expect(html.match(/<a[^>]*href="\/warga\/pengaduan"[^>]*>/)?.[0]).not.toContain('aria-current="page"');
    expect(html).toContain('href="#dashboard-content"');
    expect(html).toContain('id="dashboard-content"');
    expect(html).toContain('aria-label="Buka menu"');
    expect(html).toContain('aria-haspopup="dialog"');
  });

  it("keeps the admin menu and marks nested complaint details active", () => {
    navigation.pathname = "/admin/pengaduan/TIKET-UJI";
    const html = renderToStaticMarkup(jsx(DashboardShell, { role: "admin", userName: "Admin Uji", children: "Konten sintetis" }));
    for (const href of ["/admin", "/admin/pengaduan", "/admin/pengumuman", "/admin/konten", "/admin/profil", "/admin/notifikasi"]) {
      expect(html).toContain(`href="${href}"`);
    }
    expect(html).not.toContain('href="/warga');
    expect(html.match(/<a[^>]*href="\/admin\/pengaduan"[^>]*>/)?.[0]).toContain('aria-current="page"');
    expect(html).not.toContain("KEPALA_LINGKUNGAN");
    expect(html).not.toContain("LURAH");
  });
});

describe("accessible shared UI markup", () => {
  it("labels confirmation dialogs and initially focuses the safe cancellation action", () => {
    const html = renderToStaticMarkup(jsx(ConfirmDialog, { title: "Hapus draft?", description: "Keterangan uji", danger: true, onCancel: vi.fn(), onConfirm: vi.fn() }));
    const label = html.match(/aria-labelledby="([^"]+)"/)?.[1];
    const description = html.match(/aria-describedby="([^"]+)"/)?.[1];
    expect(html).toContain("<dialog");
    expect(label).toBeTruthy();
    expect(html).toContain(`id="${label}"`);
    expect(html).toContain(`id="${description}"`);
    expect(html).toMatch(/<button[^>]*autofocus=""[^>]*>Batalkan<\/button>/);
  });

  it("keeps whitespace-only text prompts unsubmitable and labels the textarea", () => {
    const html = renderToStaticMarkup(jsx(TextPromptDialog, { title: "Tanggapan", initialValue: "   ", onCancel: vi.fn(), onConfirm: vi.fn() }));
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Simpan<\/button>/);
    const input = html.match(/<textarea[^>]* id="([^"]+)"/)?.[1];
    expect(input).toBeTruthy();
    expect(html).toContain(`for="${input}"`);
  });

  it.each([["MENUNGGU", "Menunggu"], ["DIPROSES", "Diproses"], ["SELESAI", "Selesai"], ["DITOLAK", "Ditolak"]])("keeps %s readable without relying on color", (status, label) => {
    expect(renderToStaticMarkup(jsx(StatusBadge, { status }))).toContain(label);
  });

  it("announces loading and errors and prevents unintended form submission", () => {
    expect(renderToStaticMarkup(jsx(LoadingState, {}))).toContain('role="status"');
    expect(renderToStaticMarkup(jsx(Notice, { tone: "error", children: "Kesalahan uji" }))).toContain('role="alert"');
    expect(renderToStaticMarkup(jsx(Button, { children: "Action" }))).toContain('type="button"');
  });
});
