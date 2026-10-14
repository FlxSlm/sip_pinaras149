const messages: Record<string, string> = {
    CredentialsSignin: "Username atau password tidak valid.",
    OAuthSignin: "Login Google belum dapat dimulai. Silakan coba kembali.",
    OAuthCallback: "Login Google dibatalkan atau tidak berhasil diselesaikan. Silakan coba kembali.",
    OAuthCreateAccount: "Akun Google belum dapat dihubungkan. Silakan hubungi pengelola SIPP.",
    OAuthAccountNotLinked: "Akun ini belum terhubung dengan Google. Silakan hubungi pengelola SIPP.",
    AccessDenied: "Metode login ini tidak diizinkan untuk akun Anda. Warga menggunakan Google; admin menggunakan kredensial aplikasi.",
    Callback: "Login belum dapat diselesaikan. Silakan coba kembali atau hubungi pengelola SIPP.",
    Configuration: "Layanan login belum tersedia. Silakan hubungi pengelola SIPP.",
    SessionRequired: "Sesi Anda tidak valid atau telah berakhir. Silakan masuk kembali.",
};

export function getAuthErrorMessage(code: unknown): string {
    if (typeof code !== "string" || !code) return "";
    if (getAuthLockUntil(code)) return "Terlalu banyak percobaan login. Tunggu hingga jeda berakhir, lalu coba kembali.";
    if (getAuthAttemptsRemaining(code) !== null) return messages.CredentialsSignin;
    return Object.hasOwn(messages, code) ? messages[code] : "Login tidak berhasil. Silakan coba kembali atau hubungi pengelola SIPP.";
}

export function getAuthAttemptsRemaining(code: unknown): number | null {
    const match = typeof code === "string" ? /^AdminLoginInvalid:([1-4])$/.exec(code) : null;
    if (match) return Number(match[1]);
    return getAuthLockUntil(code) ? 0 : null;
}

export function getAuthLockUntil(code: unknown): number | null {
    const match = typeof code === "string" ? /^AdminLoginLocked:(\d{1,16})$/.exec(code) : null;
    const value = match ? Number(match[1]) : NaN;
    return Number.isSafeInteger(value) && value > 0 && value <= 8_640_000_000_000_000 ? value : null;
}
