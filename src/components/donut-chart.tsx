"use client";

import { useId, useState } from "react";
import { chartSegments, type ChartSegment } from "@/lib/chart-data";

export function DonutChart({ data, title = "Distribusi pengaduan" }: { data: ChartSegment[]; title?: string }) {
    const [view, setView] = useState("doughnut");
    const id = useId();
    const { total, segments } = chartSegments(data);
    const circumference = 2 * Math.PI * 74;
    return <div className="chart-panel">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-[var(--muted)]">{total} laporan</p>
            <label className="flex items-center gap-2 text-sm" htmlFor={id}>
                Tampilan
                <select id={id} value={view} onChange={(event) => setView(event.target.value)} className="!min-h-10 !px-3 !py-2 !text-sm">
                    <option value="doughnut">Doughnut Chart</option><option value="pie">Pie Chart</option><option value="bar">Diagram Batang</option>
                </select>
            </label>
        </div>
        <div className="chart-content">
            <div className="chart-visual" role="img" aria-label={title + ": " + segments.map((s) => s.label + " " + s.value).join(", ")}>
                {view === "bar" ? <div className="grid w-full gap-3">
                    {segments.map((item) => <div key={item.label}>
                        <div className="mb-1 flex justify-between gap-3 text-sm"><span>{item.label}</span><strong>{item.value}</strong></div>
                        <div className="h-3 overflow-hidden rounded bg-[var(--surface-2)]"><div className="h-full rounded" style={{ width: (item.ratio * 100) + "%", background: item.color }} /></div>
                    </div>)}
                </div> : <svg viewBox="0 0 200 200" className="w-full max-w-52" aria-hidden="true">
                    {total === 0 ? <circle cx="100" cy="100" r="74" fill={view === "pie" ? "var(--surface-2)" : "none"} stroke="var(--surface-2)" strokeWidth={view === "pie" ? 0 : 30} /> :
                        segments.filter((s) => s.value > 0).map((item) => {
                            if (view === "doughnut") return <circle key={item.label} cx="100" cy="100" r="74" fill="none" stroke={item.color} strokeWidth="30" strokeDasharray={item.ratio * circumference + " " + circumference} strokeDashoffset={-item.start * circumference} transform="rotate(-90 100 100)"><title>{item.label}: {item.value}</title></circle>;
                            if (item.ratio === 1) return <circle key={item.label} cx="100" cy="100" r="89" fill={item.color}><title>{item.label}: {item.value}</title></circle>;
                            const point = (fraction: number) => [100 + 89 * Math.cos(fraction * 2 * Math.PI - Math.PI / 2), 100 + 89 * Math.sin(fraction * 2 * Math.PI - Math.PI / 2)].join(" ");
                            return <path key={item.label} d={"M 100 100 L " + point(item.start) + " A 89 89 0 " + (item.ratio > .5 ? 1 : 0) + " 1 " + point(item.end) + " Z"} fill={item.color} stroke="white" strokeWidth="1"><title>{item.label}: {item.value}</title></path>;
                        })}
                    {view === "doughnut" && <><text x="100" y="99" textAnchor="middle" fill="var(--ink)" fontSize="28" fontWeight="700">{total}</text><text x="100" y="122" textAnchor="middle" fill="var(--muted)" fontSize="14">Total laporan</text></>}
                </svg>}
            </div>
            <ul className="min-w-0 flex-1 divide-y divide-[var(--line)]">
                {segments.map((item) => <li key={item.label} className="flex items-center gap-2 py-3 text-sm">
                    <span className="size-3 shrink-0 rounded-full" style={{ background: item.color }} />
                    <span className="flex-1">{item.label}</span><strong className="tabular-nums">{item.value}</strong><span className="w-12 text-right text-[var(--muted)]">{Math.round(item.ratio * 100)}%</span>
                </li>)}
            </ul>
        </div>
        {total === 0 && <p className="mt-3 text-sm text-[var(--muted)]">Belum ada laporan untuk ditampilkan.</p>}
    </div>;
}
