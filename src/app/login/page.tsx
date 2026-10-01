"use client";

import { FormEvent, useState } from "react";
import { getProviders, getSession, signIn } from "next-auth/react";
import { useEffect } from "react";
import { getRoleHome } from "@/lib/authorization";

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
        <main className="min-h-screen bg-[var(--surface)] px-5 py-10 sm:px-8 sm:py-16">
            <div className="mx-auto max-w-md rounded-[2rem] border border-[var(--line)] bg-white p-6 shadow-[0_20px_50px_rgba(20,40,55,0.1)] sm:p-9">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--accent)]">
                    SIP Pinaras
                </p>
                <h1 className="mt-4 text-4xl font-bold text-[var(--ink)]">Masuk ke layanan</h1>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                    Warga masuk dengan akun Google atau Facebook. Petugas menggunakan username dan password yang diberikan kelurahan.
                </p>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                    <button
                        type="button"
                        disabled={!providers?.google}
                        onClick={() => signIn("google", { callbackUrl: getCallbackUrl() })}
                        className="rounded-full bg-[var(--ink)] px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {providers === null ? "Memuat..." : providers.google ? "Lanjut dengan Google" : "Google belum dikonfigurasi"}
                    </button>
                    <button
                        type="button"
                        disabled={!providers?.facebook}
                        onClick={() => signIn("facebook", { callbackUrl: getCallbackUrl() })}
                        className="rounded-full border border-[var(--line)] px-4 py-3 text-sm font-bold text-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {providers === null ? "Memuat..." : providers.facebook ? "Lanjut dengan Facebook" : "Facebook belum dikonfigurasi"}
                    </button>
                </div>

                <div className="my-8 flex items-center gap-3 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                    <span className="h-px flex-1 bg-[var(--line)]" />
                    Petugas
                    <span className="h-px flex-1 bg-[var(--line)]" />
                </div>

                <form className="space-y-4" onSubmit={handleStaffLogin}>
                    <label className="block text-sm font-medium text-[var(--ink)]">
                        Username
                        <input
                            value={username}
                            onChange={(event) => setUsername(event.target.value)}
                            autoComplete="username"
                            className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-3 outline-none focus:border-[var(--accent)]"
                            required
                        />
                    </label>
                    <label className="block text-sm font-medium text-[var(--ink)]">
                        Password
                        <input
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            autoComplete="current-password"
                            className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-3 outline-none focus:border-[var(--accent)]"
                            required
                        />
                    </label>
                    {error && <p className="text-sm text-red-700">Username atau password tidak valid.</p>}
                    <button
                        type="submit"
                        disabled={pending}
                        className="w-full rounded-full bg-[var(--accent)] px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
                    >
                        {pending ? "Memeriksa..." : "Masuk sebagai petugas"}
                    </button>
                </form>
            </div>
        </main>
    );
}