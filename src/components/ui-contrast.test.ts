import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
const root = css.slice(css.indexOf(":root {"), css.indexOf("@theme"));

function token(name: string): string {
  const value = root.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1].trim();
  if (!value) throw new Error(`Missing color: ${name}`);
  const alias = value.match(/^var\(--([\w-]+)\)$/);
  return alias ? token(alias[1]) : value;
}

function luminance(hex: string): number {
  const rgb = hex.replace("#", "").match(/.{2}/g)!.map((part) => parseInt(part, 16) / 255);
  const linear = rgb.map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}

function contrast(a: string, b: string): number {
  const values = [luminance(token(a)), luminance(token(b))].sort((x, y) => y - x);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

describe("foundation color contrast", () => {
  it.each([
    ["ink", "white"], ["muted", "white"], ["muted", "surface"],
    ["white", "brand"], ["white", "leaf"], ["white", "danger"],
    ["brand-dark", "brand-soft"], ["leaf-dark", "soft-accent"],
    ["gold", "gold-soft"], ["danger", "danger-soft"],
  ])("%s on %s meets 4.5:1 for normal text", (foreground, background) => {
    expect(contrast(foreground, background)).toBeGreaterThanOrEqual(4.5);
  });
  it("keeps the focus outline visible on white controls", () => {
    expect(contrast("focus", "white")).toBeGreaterThanOrEqual(3);
  });
});
