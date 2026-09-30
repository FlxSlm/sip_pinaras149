"use client";

import { FormEvent, useState } from "react";

export function UsernameForm({ initialUsername }: { initialUsername: string }) {
    const [username, setUsername] = useState(initialUsername);
    const [message, setMessage] = useState("");
    const [pending, setPending] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setPending(true);
        setMessage("");

        const response = await fetch("/api/profile/username", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username }),
        });
        const result = (await response.json()) as { username?: string; message?: string };
        setMessage(result.message ?? (response.ok ? "Username diperbarui." : "Username tidak dapat diperbarui."));
        if (response.ok && result.username) setUsername(result.username);
        setPending(false);
    }

    return (
        <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-[var(--ink)]" htmlFor="username">
                Username
            </label>
            <input
                id="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                minLength={3}
                maxLength={24}
                required
                className="w-full rounded-md border border-[var(--line)] px-3 py-3"
            />
            {message && <p className="text-sm text-[var(--muted)]">{message}</p>}
            <button
                type="submit"
                disabled={pending}
                className="rounded-md bg-[var(--ink)] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
                {pending ? "Menyimpan..." : "Simpan username"}
            </button>
        </form>
    );
}