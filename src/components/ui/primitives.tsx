import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react";
import { Icon } from "./icon";

export type ButtonVariant = "primary" | "secondary" | "success" | "danger" | "ghost";

export function buttonClassName(variant: ButtonVariant = "primary", className = "") {
  return `ui-button ui-button-${variant} ${className}`;
}

export function Button({ variant = "primary", className = "", type = "button", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return <button type={type} className={buttonClassName(variant, className)} {...props} />;
}

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`ui-card ${className}`} {...props} />;
}

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`ui-field ${className}`} {...props} />;
}

export function Select({ className = "", ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`ui-field ${className}`} {...props} />;
}

export function Textarea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`ui-field ${className}`} {...props} />;
}

export function Notice({ children, tone = "info", className = "" }: { children: ReactNode; tone?: "info" | "success" | "error"; className?: string }) {
  const colors = { info: "ui-tone-progress", success: "ui-tone-done", error: "ui-tone-rejected" };
  return <div role={tone === "error" ? "alert" : "status"} className={`flex items-start gap-3 rounded-xl px-4 py-3 text-sm leading-6 ${colors[tone]} ${className}`}><Icon name={tone === "error" ? "warning" : tone === "success" ? "check" : "info"} className="mt-0.5 size-5" /><div className="min-w-0">{children}</div></div>;
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return <div className="flex flex-col items-center px-5 py-10 text-center"><span className="mb-4 grid size-14 place-items-center rounded-2xl bg-[var(--brand-soft)] text-[var(--brand)]"><Icon name="complaint" className="size-7" /></span><h2 className="text-lg font-semibold">{title}</h2>{description && <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--muted)]">{description}</p>}{action && <div className="mt-5">{action}</div>}</div>;
}

export function LoadingState({ label = "Memuat informasi…" }: { label?: string }) {
  return <div role="status" aria-live="polite" className="space-y-4"><p className="text-sm text-[var(--muted)]">{label}</p><div aria-hidden="true" className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="ui-card flex animate-pulse items-center gap-4 p-5"><div className="size-10 shrink-0 rounded-xl bg-[var(--surface-2)]" /><div className="flex-1 space-y-2"><div className="h-3 w-1/2 rounded-full bg-[var(--surface-2)]" /><div className="h-3 w-3/4 rounded-full bg-[var(--surface-2)]" /></div></div>)}</div></div>;
}

export function TableContainer({ children, label }: { children: ReactNode; label: string }) {
  return <div className="ui-table-scroll" role="region" aria-label={label} tabIndex={0}>{children}</div>;
}
