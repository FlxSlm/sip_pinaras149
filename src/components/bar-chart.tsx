"use client";

type Datum = { label: string; value: number; color: string };

export function BarChart({ data }: { data: Datum[] }) {
    const maxValue = Math.max(1, ...data.map((item) => item.value));

    return (
        <div className="space-y-3.5">
            {data.map((item) => (
                <div key={item.label} className="group">
                    <div className="flex items-center justify-between text-sm font-semibold text-[var(--muted)]">
                        <span>{item.label}</span>
                        <span className="text-[var(--ink)]">{item.value}</span>
                    </div>
                    <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-[var(--surface-2)]">
                        <div
                            className="h-full rounded-full transition-all duration-500 group-hover:opacity-80"
                            style={{ width: `${Math.round((item.value / maxValue) * 100)}%`, backgroundColor: item.color }}
                            title={`${item.label}: ${item.value}`}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}
