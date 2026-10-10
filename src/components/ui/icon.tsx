import type { SVGProps } from "react";

const paths = {
  dashboard: "M3 10 12 3l9 7M5 9v12h5v-7h4v7h5V9",
  complaint: "M14 3H5v18h14V8l-5-5Zm0 0v5h5M8 12h8M8 16h6",
  plus: "M12 5v14M5 12h14",
  history: "M3 11a9 9 0 1 1 2.4 7M3 5v6h6M12 7v5l3 2",
  announcement: "m4 9 14-5v16L4 15V9Zm0 0H2v6h2M7 16l2 5h3l-2-4M21 9v6",
  bell: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4",
  profile: "M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 21v-2a8 8 0 0 1 16 0v2",
  content: "M3 3h18v18H3V3Zm5 0v18M12 8h5M12 12h5M12 16h3",
  menu: "M4 6h16M4 12h16M4 18h16",
  close: "m6 6 12 12M6 18 18 6",
  arrow: "M4 12h16m-6-6 6 6-6 6",
  chevron: "m9 5 7 7-7 7",
  location: "M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0ZM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
  info: "M12 11v6M12 7h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z",
  check: "m5 12 4 4L19 6",
  warning: "m12 3 10 18H2L12 3Zm0 6v5m0 3h.01",
  logout: "M9 4H3v16h6M9 12h12m-5-5 5 5-5 5",
  leaf: "M20 3C9 2 3 7 5 15c5 8 16 2 15-12ZM3 21 15 9",
  upload: "M12 16V3m-5 5 5-5 5 5M4 15v6h16v-6",
  search: "M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z",
} as const;

export type IconName = keyof typeof paths;

export function Icon({ name, className = "size-5", ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={`shrink-0 ${className}`} {...props}><path d={paths[name]} /></svg>;
}
