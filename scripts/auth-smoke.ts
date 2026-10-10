import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production", { info() {}, error() {} });

const origin = "http://localhost:3000";
const cookies = new Map<string, string>();

async function request(path: string, init: RequestInit = {}) {
  const response = await fetch(`${origin}${path}`, {
    ...init,
    redirect: "manual",
    headers: { ...init.headers, Cookie: Array.from(cookies, ([key, value]) => `${key}=${value}`).join("; ") },
  });
  for (const header of response.headers.getSetCookie()) {
    const [pair] = header.split(";");
    const separator = pair.indexOf("=");
    cookies.set(pair.slice(0, separator), pair.slice(separator + 1));
  }
  return response;
}

async function main() {
  if (!process.env.ADMIN_SEED_PASSWORD) throw new Error("Missing seed password");
  const providersResponse = await request("/api/auth/providers");
  const providers = await providersResponse.json();
  const csrfResponse = await request("/api/auth/csrf");
  const { csrfToken } = await csrfResponse.json();
  const response = await request("/api/auth/callback/credentials", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ csrfToken, username: "admin.pinaras", password: process.env.ADMIN_SEED_PASSWORD, callbackUrl: `${origin}/admin`, json: "true" }),
  });
  const result = await response.json();
  const code = typeof result.url === "string" ? new URL(result.url, origin).searchParams.get("error") : null;
  const sessionResponse = await request("/api/auth/session");
  const session = await sessionResponse.json();
  const dashboardResponse = await request("/admin");
  const loginResponse = await request("/login?callbackUrl=%2Fwarga");
  const loginHtml = await loginResponse.text();
  const streamedLoginRedirect = loginHtml.match(/<meta[^>]*http-equiv="refresh"[^>]*content="[^\"]*url=([^\"]+)"/i)?.[1];
  const wrongRoleResponse = await request("/warga");
  const redirectPath = (response: Response) => {
    const location = response.headers.get("location");
    if (!location) return null;
    const path = new URL(location, origin).pathname;
    return ["/admin", "/warga", "/login"].includes(path) ? path : "other";
  };
  console.log(JSON.stringify({
    providersAvailable: { google: Boolean(providers.google), credentials: Boolean(providers.credentials) },
    configuredOriginMatchesLocal: process.env.NEXTAUTH_URL ? new URL(process.env.NEXTAUTH_URL).origin === origin : false,
    credentialsStatus: response.status,
    credentialsRejected: typeof result.url === "string" && result.url.includes("error="),
    errorCode: ["CredentialsSignin", "AccessDenied", "Callback", "Configuration", "SessionRequired"].includes(code ?? "") ? code : code ? "other" : null,
    errorCategory: !code ? null : {
      databaseConnection: /connect|ECONN|Can't reach|timeout/i.test(code),
      databaseAuthentication: /password authentication|SASL|SCRAM/i.test(code),
      schemaMismatch: /column|relation|does not exist|Unknown argument|P202[12]/i.test(code),
      missingRuntimeObject: /undefined|null.*reading|not a function/i.test(code),
      invalidPrismaQuery: /Invalid.*invocation|validation/i.test(code),
      prismaCode: code.match(/\bP\d{4}\b/)?.[0] ?? null,
    },
    redirectToAdmin: result.url === `${origin}/admin`,
    sessionValid: Boolean(session.user?.id),
    sessionRole: ["WARGA", "ADMIN_KELURAHAN"].includes(session.user?.role) ? session.user.role : "missing-or-invalid",
    dashboardStatus: dashboardResponse.status,
    dashboardRedirectsToLogin: dashboardResponse.headers.get("location")?.includes("/login") ?? false,
    existingSessionLogin: { status: loginResponse.status, redirectPath: redirectPath(loginResponse) },
    existingSessionLoginRedirectsToAdmin: redirectPath(loginResponse) === "/admin" || streamedLoginRedirect === "/admin",
    adminAccessToWarga: { status: wrongRoleResponse.status, redirectPath: redirectPath(wrongRoleResponse) },
  }));
  if (!session.user?.id || session.user.role !== "ADMIN_KELURAHAN" || dashboardResponse.status !== 200 || (redirectPath(loginResponse) !== "/admin" && streamedLoginRedirect !== "/admin") || redirectPath(wrongRoleResponse) !== "/admin") process.exitCode = 1;
  cookies.clear();
  const guestResponse = await request("/admin");
  const wrongCsrf = await (await request("/api/auth/csrf")).json();
  const wrongResponse = await request("/api/auth/callback/credentials", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ csrfToken: wrongCsrf.csrfToken, username: "admin.pinaras", password: `${process.env.ADMIN_SEED_PASSWORD}-incorrect`, callbackUrl: `${origin}/admin`, json: "true" }),
  });
  const wrongResult = await wrongResponse.json();
  const wrongSession = await (await request("/api/auth/session")).json();
  const wrongPasswordRejected = typeof wrongResult.url === "string" && new URL(wrongResult.url, origin).searchParams.get("error") === "CredentialsSignin";
  console.log(JSON.stringify({ guestRedirectsToLogin: guestResponse.status === 307 && guestResponse.headers.get("location")?.includes("/login"), wrongPasswordRejected, wrongPasswordCreatesNoSession: !wrongSession.user }));
  if (!wrongPasswordRejected || wrongSession.user) process.exitCode = 1;
}

main().catch(() => { console.log("Authentication smoke test failed; secret details withheld."); process.exitCode = 1; });
