// @vitest-environment jsdom
import { act } from "react";
import { jsx } from "react/jsx-runtime";
import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
import { describe, expect, it } from "vitest";
import { DonutChart } from "@/components/donut-chart";

describe("chart hydration regression", () => {
    it("hydrates a nonempty SVG chart with identical server/client DOM", async () => {
        const chart = jsx(DonutChart, { title: "Status pengaduan", data: [{ label: "Menunggu", value: 3, color: "#c08a1a" }, { label: "Selesai", value: 1, color: "#07845c" }] });
        const container = document.createElement("div"); container.innerHTML = renderToString(chart); document.body.append(container);
        const errors: unknown[] = [];
        let root: ReturnType<typeof hydrateRoot>;
        await act(async () => { root = hydrateRoot(container, chart, { onRecoverableError: (error) => errors.push(error) }); });
        expect(errors).toEqual([]);
        expect(container.querySelectorAll("circle")).toHaveLength(2);
        expect(container.querySelectorAll("title")).toHaveLength(0);
        await act(async () => root!.unmount()); container.remove();
    });
});
