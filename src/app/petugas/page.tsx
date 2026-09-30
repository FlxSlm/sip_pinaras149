import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getRoleHome } from "@/lib/authorization";

export default async function PetugasPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");
    if (session.user.role === "warga") redirect("/warga");
    redirect(getRoleHome(session.user.role));
}