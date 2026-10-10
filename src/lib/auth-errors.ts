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
    return Object.hasOwn(messages, code) ? messages[code] : "Login tidak berhasil. Silakan coba kembali atau hubungi pengelola SIPP.";
}
