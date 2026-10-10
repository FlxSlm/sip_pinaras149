import type { ReactNode } from "react";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";

export default function PublicLayout({ children }: { children: ReactNode }) {
    return <div className="flex min-h-dvh flex-col"><PublicHeader /><main id="public-content" tabIndex={-1} className="min-w-0 flex-1">{children}</main><PublicFooter /></div>;
}
