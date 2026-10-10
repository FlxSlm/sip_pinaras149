import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import LoginForm from "@/components/login-form";
import { authOptions } from "@/lib/auth";
import { getLoginDestination, isUserRole } from "@/lib/authorization";
import { getAuthErrorMessage } from "@/lib/auth-errors";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const params = await searchParams;
    const callbackUrl = typeof params.callbackUrl === "string" ? params.callbackUrl : undefined;
    const session = await getServerSession(authOptions);
    if (session?.user.id && isUserRole(session.user.role)) {
        redirect(getLoginDestination(session.user.role, callbackUrl));
    }
    return <LoginForm callbackUrl={callbackUrl} initialError={getAuthErrorMessage(params.error)} />;
}
