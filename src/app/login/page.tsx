"use client";

import { FormEvent, useEffect, useState } from "react";
import { getProviders, getSession, signIn } from "next-auth/react";
import { getRoleHome } from "@/lib/authorization";
import Image from "next/image";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(false);
    const [pending, setPending] = useState(false);
    const [providers, setProviders] = useState<Record<string, { name?: string }> | null>(null);

    useEffect(() => {
        void getProviders().then((availableProviders) => setProviders(availableProviders as Record<string, { name?: string }> | null));
    }, []);

    function getCallbackUrl() {
        const callbackUrl = new URLSearchParams(window.location.search).get("callbackUrl");
        return callbackUrl?.startsWith("/") && !callbackUrl.startsWith("//") ? callbackUrl : "/warga";
    }

    async function handleStaffLogin(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setPending(true);
        setError(false);

        const result = await signIn("credentials", {
            username,
            password,
            redirect: false,
            callbackUrl: getCallbackUrl(),
        });

        if (!result?.ok) {
            setError(true);
            setPending(false);
            return;
        }

        const session = await getSession();
        window.location.assign(getRoleHome(session?.user.role));
    }

    return (
        <main className="nature-hero grid min-h-screen place-items-center px-5 py-10 sm:px-8">
            <div className="w-full max-w-md rounded-[1.75rem] border border-white/20 bg-white p-7 shadow-[0_24px_60px_rgba(8,47,66,0.28)] sm:p-9">
                <div className="flex items-center gap-3">
                    <div className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-[var(--leaf)] to-[var(--brand)] text-lg font-black text-white">
                        P
                    </div>
                    <div>
                        <p className="text-lg font-extrabold text-[var(--ink)]">SIP Pinaras</p>
                        <p className="text-xs text-[var(--muted)]">Sistem Informasi Peduli Pinaras</p>
                    </div>
                </div>

                <h1 className="mt-7 text-3xl font-extrabold text-[var(--ink)]">Masuk ke layanan</h1>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    Warga masuk dengan akun Google. Admin Kelurahan menggunakan kredensial aplikasi.
                </p>

                <button
                    type="button"
                    disabled={!providers?.google}
                    onClick={() => signIn("google", { callbackUrl: getCallbackUrl() })}
                    className="mt-7 inline-flex w-full items-center justify-center gap-3 rounded-xl border border-[var(--line)] bg-white px-4 py-3.5 text-sm font-bold text-[var(--ink)] shadow-sm hover:bg-[var(--surface)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Image src="/images/google-logo.jpg" alt="" width={20} height={20} className="size-5 rounded-full object-contain" />
                    {providers === null ? "Memuat..." : providers.google ? "Lanjut dengan Google" : "Google belum dikonfigurasi"}
                </button>

                <div className="my-7 flex items-center gap-3 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                    <span className="h-px flex-1 bg-[var(--line)]" />
                    Admin Kelurahan
                    <span className="h-px flex-1 bg-[var(--line)]" />
                </div>

                <form className="space-y-4" onSubmit={handleStaffLogin}>
                    <label className="block text-sm font-semibold text-[var(--ink)]">
                        Username
                        <input
                            value={username}
                            onChange={(event) => setUsername(event.target.value)}
                            autoComplete="username"
                            className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3.5 py-3 text-[var(--ink)] outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/15"
                            required
                        />
                    </label>
                    <label className="block text-sm font-semibold text-[var(--ink)]">
                        Password
                        <input
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            autoComplete="current-password"
                            className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3.5 py-3 text-[var(--ink)] outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/15"
                            required
                        />
                    </label>
                    {error && <p className="text-sm font-medium text-[var(--danger)]">Username atau password tidak valid.</p>}
                    <button
                        type="submit"
                        disabled={pending}
                        className="w-full rounded-xl bg-[var(--brand)] px-4 py-3.5 text-sm font-bold text-white hover:bg-[var(--brand-dark)] disabled:opacity-60"
                    >
                        {pending ? "Memeriksa..." : "Masuk sebagai Admin Kelurahan"}
                    </button>
                </form>
            </div>
        </main>
    );
}
