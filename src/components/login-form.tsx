"use client";

import { FormEvent, useEffect, useState } from "react";
import { getProviders, getSession, signIn } from "next-auth/react";
import { getLoginDestination } from "@/lib/authorization";
import { getAuthErrorMessage, getAuthAttemptsRemaining, getAuthLockUntil } from "@/lib/auth-errors";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function LoginForm({ callbackUrl, initialError, initialBlockedUntil = null, initialAttemptsRemaining = null }: { callbackUrl?: string; initialError: string; initialBlockedUntil?: number | null; initialAttemptsRemaining?: number | null }) {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(initialError);
    const [pending, setPending] = useState(false);
    const [blockedUntil, setBlockedUntil] = useState(initialBlockedUntil);
    const [remaining, setRemaining] = useState(0);
    const [attemptsRemaining, setAttemptsRemaining] = useState(initialAttemptsRemaining);
    const [providers, setProviders] = useState<Record<string, { name?: string }> | null>(null);

    useEffect(() => {
        void getProviders().then((availableProviders) => setProviders(availableProviders ?? {})).catch(() => {
            setProviders({});
            setError("Layanan login belum dapat dihubungi. Silakan coba lagi.");
        });
    }, []);

    useEffect(() => {
        const tick = () => setRemaining(blockedUntil ? Math.max(0, Math.ceil((blockedUntil - Date.now()) / 1000)) : 0);
        const timer = window.setInterval(tick, 1000); tick();
        return () => window.clearInterval(timer);
    }, [blockedUntil]);

    async function handleGoogleLogin() {
        setPending(true);
        setError("");
        try {
            await signIn("google", { callbackUrl: getLoginDestination("WARGA", callbackUrl) });
        } catch {
            setError(getAuthErrorMessage("OAuthSignin"));
        } finally {
            setPending(false);
        }
    }

    async function handleStaffLogin(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (pending || remaining > 0) return;
        setPending(true);
        setError("");

        try {
            const result = await signIn("credentials", {
                username,
                password,
                redirect: false,
                callbackUrl: getLoginDestination("ADMIN_KELURAHAN", callbackUrl),
            });

            if (!result?.ok || result.error) {
                setError(getAuthErrorMessage(result?.error ?? "CredentialsSignin"));
                const until = getAuthLockUntil(result?.error);
                setBlockedUntil(until);
                setRemaining(until ? Math.max(0, Math.ceil((until - Date.now()) / 1000)) : 0);
                setAttemptsRemaining(getAuthAttemptsRemaining(result?.error));
                return;
            }

            const session = await getSession();
            if (!session?.user.id || session.user.role !== "ADMIN_KELURAHAN") {
                setError(getAuthErrorMessage("SessionRequired"));
                return;
            }
            setPassword(""); router.replace(getLoginDestination(session.user.role, callbackUrl)); router.refresh();
        } catch {
            setError("Layanan login belum dapat dihubungi. Silakan coba lagi.");
        } finally {
            setPending(false);
        }
    }

    return (
        <main className="nature-hero login-page">
            {/* Header / Brand */}
            <div className="relative mx-auto flex w-full max-w-7xl items-center gap-3 pb-8">
                <Image src="/images/logo tomohon.png" alt="Logo Tomohon" width={48} height={48} className="logo-pentagon size-12 object-contain" />
                <div className="text-white">
                    <p className="text-xl font-bold leading-tight tracking-wide">SIPP</p>
                    <p className="text-sm font-medium leading-tight text-white">Sistem Informasi Peduli Pinaras</p>
                </div>
            </div>

            {/* Top Right Tagline */}
            <div className="absolute right-6 top-6 hidden lg:right-20 lg:top-10 lg:block">
                <p className="font-sans text-xl font-medium italic text-white/90">
                    Bersama Membangun<br />Pinaras yang Lebih Baik
                </p>
            </div>

            <div className="mx-auto w-full max-w-7xl">
                <div className="flex flex-col items-center justify-between gap-12 lg:flex-row lg:items-stretch lg:gap-8">
                    {/* Left Content */}
                    <div className="flex w-full flex-col justify-center lg:w-[55%]">
                        <p className="text-xl text-white sm:text-2xl">Selamat Datang di</p>
                        <h1 className="mt-1 text-4xl font-extrabold leading-tight text-white sm:text-6xl lg:text-[4rem]">
                            SIPP
                        </h1>
                        <p className="mt-6 max-w-xl text-base leading-relaxed text-white/90 sm:text-lg">
                            Sistem Informasi Peduli Pinaras, hadir untuk memberikan informasi, layanan pengaduan, dan berbagai potensi Kelurahan Pinaras secara transparan, cepat dan mudah diakses.
                        </p>

                        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4">
                            <div className="flex flex-col items-center gap-3">
                                <div className="flex size-14 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm">
                                    <svg viewBox="0 0 24 24" className="size-6" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm1 15h-2v-6h2v6Zm0-8h-2V7h2v2Z"/></svg>
                                </div>
                                <p className="text-center text-[11px] font-semibold text-white sm:text-xs">Informasi<br/>Kelurahan</p>
                            </div>
                            <div className="flex flex-col items-center gap-3">
                                <div className="flex size-14 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm">
                                    <svg viewBox="0 0 24 24" className="size-6" fill="currentColor"><path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Zm-9 14H7v-2h3v2Zm0-4H7v-2h3v2Zm0-4H7V7h3v2Zm6 8h-4v-2h4v2Zm0-4h-4v-2h4v2Zm0-4h-4V7h4v2Z"/></svg>
                                </div>
                                <p className="text-center text-[11px] font-semibold text-white sm:text-xs">Layanan<br/>Pengaduan</p>
                            </div>
                            <div className="flex flex-col items-center gap-3">
                                <div className="flex size-14 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm">
                                    <svg viewBox="0 0 24 24" className="size-6" fill="currentColor"><path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3Zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9ZM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72Z"/></svg>
                                </div>
                                <p className="text-center text-[11px] font-semibold text-white sm:text-xs">Potensi<br/>& UMKM</p>
                            </div>
                            <div className="flex flex-col items-center gap-3">
                                <div className="flex size-14 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm">
                                    <svg viewBox="0 0 24 24" className="size-6" fill="currentColor"><path d="M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2Zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4a1.5 1.5 0 0 0-3 0v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2Z"/></svg>
                                </div>
                                <p className="text-center text-[11px] font-semibold text-white sm:text-xs">Pengumuman<br/>Terkini</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Login Card */}
                    <div className="flex w-full flex-col justify-center lg:w-[45%] lg:max-w-[480px]">
                        <div className="rounded-3xl bg-white p-5 shadow-2xl sm:p-6">
                            <h2 className="text-2xl font-extrabold text-[var(--brand-deep)]">Halo!</h2>
                            <p className="mt-1 text-lg font-medium text-[var(--brand-deep)]">Silakan masuk ke akun Anda</p>

                            <button
                                type="button"
                                disabled={pending || !providers?.google}
                                onClick={handleGoogleLogin}
                                className="mt-6 flex w-full items-center justify-between rounded-full border border-[var(--line)] bg-white px-5 py-3 transition hover:bg-[var(--surface)] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <span className="flex items-center gap-4 text-sm font-bold text-[var(--ink)]">
                                    <Image src="/images/Google Logo.jpg" alt="Google" width={24} height={24} className="size-6 rounded-full object-contain" />
                                    {providers === null ? "Memuat..." : providers.google ? "Lanjutkan dengan Google" : "Google belum dikonfigurasi"}
                                </span>
                                <span className="text-[var(--muted)]">→</span>
                            </button>

                            <p className="mt-3 text-center text-[12px] leading-relaxed text-[var(--muted)]">
                                Untuk warga, gunakan akun Google Anda<br />untuk mengakses layanan pengaduan.
                            </p>

                            <div className="my-5 flex items-center gap-4 text-[12px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                                <span className="h-px flex-1 bg-[var(--line)]" />
                                atau
                                <span className="h-px flex-1 bg-[var(--line)]" />
                            </div>

                            {error && <p role="alert" className="mt-4 text-[13px] font-medium text-[var(--danger)]">{error}</p>}
                            {remaining > 0 && <p role="status" className="mt-3 text-sm text-[var(--muted)]">Coba kembali dalam {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")}</p>}
                            {attemptsRemaining !== null && <p role="status" className="mt-3 text-sm text-[var(--muted)]">{blockedUntil && remaining === 0 ? "Jeda selesai. Anda dapat mencoba sekali lagi. Jika salah, jeda berikutnya diperpanjang." : `Sisa percobaan sebelum jeda: ${attemptsRemaining}.`}</p>}
                            <form className="space-y-3" onSubmit={handleStaffLogin}>
                                <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--ink)]">
                                    <svg viewBox="0 0 24 24" className="size-5 text-[var(--leaf)]" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4Zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8Z"/></svg>
                                    Login Admin Kelurahan
                                </h3>

                                <div className="space-y-3">
                                    <div className="relative">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                            <svg viewBox="0 0 24 24" className="size-5 text-[var(--muted)]" fill="currentColor"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Z"/></svg>
                                        </div>
                                        <input
                                            aria-label="Username admin"
                                            value={username}
                                            onChange={(event) => { setUsername(event.target.value); setAttemptsRemaining(null); setBlockedUntil(null); setRemaining(0); setError(""); }}
                                            autoComplete="username"
                                            placeholder="Username admin"
                                            className="w-full rounded-xl border border-[var(--line)] bg-white py-3 pl-12 pr-4 text-sm font-semibold text-[var(--ink)] outline-none transition focus:border-[var(--leaf)] focus:ring-1 focus:ring-[var(--leaf)]"
                                            required
                                        />
                                    </div>
                                    <div className="relative">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                            <svg viewBox="0 0 24 24" className="size-5 text-[var(--muted)]" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2Zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2Zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2Z"/></svg>
                                        </div>
                                        <input
                                            type="password"
                                            aria-label="Password admin"
                                            value={password}
                                            onChange={(event) => setPassword(event.target.value)}
                                            autoComplete="current-password"
                                            placeholder="Password"
                                            className="w-full rounded-xl border border-[var(--line)] bg-white py-3 pl-12 pr-12 text-sm font-semibold text-[var(--ink)] outline-none transition focus:border-[var(--leaf)] focus:ring-1 focus:ring-[var(--leaf)]"
                                            required
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={pending || remaining > 0}
                                    className="w-full rounded-full bg-[var(--leaf-dark)] px-6 py-3 text-sm font-bold text-white transition hover:bg-[var(--brand-deep)] disabled:opacity-60"
                                >
                                    {pending ? "Memeriksa..." : remaining > 0 ? "Menunggu jeda login" : "Masuk →"}
                                </button>
                                <p className="text-xs leading-5 text-[var(--muted)]">Lima kegagalan login akan memberi jeda 1 menit. Jika masih salah setelah jeda, waktu tunggu menjadi 3 menit, 9 menit, dan seterusnya.</p>
                            </form>

                            <div className="mt-5 flex items-start gap-3 rounded-2xl bg-[var(--surface)] p-3 text-[11px] text-[var(--muted)]">
                                <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z"/></svg>
                                <p>Kelurahan Pinaras<br />Kecamatan Tomohon Selatan, Kota Tomohon</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Absolute Footer */}
            <div className="relative mx-auto mt-8 flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 text-xs text-white/85">
                <p className="flex items-center gap-2"><svg viewBox="0 0 24 24" className="size-4" fill="currentColor"><path d="M12 2L2 22h20L12 2Zm0 3.82L18.44 19H5.56L12 5.82ZM11 10h2v5h-2v-5Zm0 6h2v2h-2v-2Z"/></svg> Kelurahan Pinaras | Kecamatan Tomohon Selatan | Kota Tomohon</p>
                <p className="ml-auto text-right">© Dibuat oleh KKT 149 UNSRAT Pinaras</p>
            </div>
        </main>
    );
}
