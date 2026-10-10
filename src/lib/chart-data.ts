export type ChartSegment = { label: string; value: number; color: string };
export function chartSegments(data: ChartSegment[]) {
    const clean = data.map((item) => ({ ...item, value: Number.isFinite(item.value) && item.value > 0 ? item.value : 0 }));
    const total = clean.reduce((sum, item) => sum + item.value, 0);
    let start = 0;
    return { total, segments: clean.map((item) => {
        const ratio = total ? item.value / total : 0;
        const segment = { ...item, ratio, start, end: start + ratio };
        start += ratio;
        return segment;
    }) };
}
