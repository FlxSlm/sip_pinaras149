"use client";

type Segment = { label: string; value: number; color: string };

export function DonutChart({ data, title }: { data: Segment[]; title?: string }) {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const size = 160;
    const strokeWidth = 28;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    // Pre-calculate segments to avoid mutating variables during render mapping
    const segments = data.reduce<{ items: (Segment & { dashLength: number; dashOffset: number; ratio: number })[]; cumulative: number }>(
        (acc, segment) => {
            const ratio = total > 0 ? segment.value / total : 0;
            const dashLength = ratio * circumference;
            const dashOffset = -acc.cumulative;
            acc.items.push({ ...segment, dashLength, dashOffset, ratio });
            acc.cumulative += dashLength;
            return acc;
        },
        { items: [], cumulative: 0 }
    ).items;

    return (
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start sm:gap-8">
            {/* Donut SVG */}
            <div className="relative shrink-0" style={{ width: size, height: size }}>
                <svg viewBox={`0 0 ${size} ${size}`} className="size-full -rotate-90">
                    {/* Background track */}
                    <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--surface-2)" strokeWidth={strokeWidth} />
                    {/* Segments */}
                    {segments.map((segment) => (
                        <circle
                            key={segment.label}
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke={segment.color}
                            strokeWidth={strokeWidth}
                            strokeDasharray={`${segment.dashLength} ${circumference - segment.dashLength}`}
                            strokeDashoffset={segment.dashOffset}
                            strokeLinecap="round"
                            className="transition-all duration-500"
                        />
                    ))}
                </svg>
                {/* Center label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-[var(--ink)]">{total}</span>
                    <span className="text-[11px] text-[var(--muted)]">Total</span>
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-col justify-center gap-3">
                {title && <p className="text-sm font-bold text-[var(--ink)]">{title}</p>}
                {segments.map((segment) => {
                    const pct = total > 0 ? Math.round(segment.ratio * 100) : 0;
                    return (
                        <div key={segment.label} className="flex items-center gap-3">
                            <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: segment.color }} />
                            <span className="min-w-[90px] text-sm text-[var(--ink)]">{segment.label}</span>
                            <span className="text-sm font-semibold text-[var(--ink)]">{segment.value} ({pct}%)</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
