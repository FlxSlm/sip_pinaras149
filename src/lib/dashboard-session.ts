import { cache } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Request-scoped only. Never persist/cache private sessions across users.
export const getDashboardSession = cache(() => getServerSession(authOptions));
