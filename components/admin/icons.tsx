import type { SVGProps } from "react";

/** Yalın çizgi ikon seti (24×24, currentColor). Admin nav + aksiyonlar için. */
const P: Record<string, string> = {
  panel: "M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6V11h-6v9Zm0-16v5h6V4h-6Z",
  content: "M4 5h16M4 12h16M4 19h10",
  pages: "M7 3h7l5 5v13H7V3Zm7 0v5h5M10 13h6M10 17h6",
  image: "M4 5h16v14H4V5Zm0 11 4-4 3 3 4-5 5 6",
  inbox: "M4 4h16v16H4V4Zm0 9h4l2 3h4l2-3h4",
  calendar: "M4 6h16v14H4V6Zm0 5h16M8 3v4M16 3v4",
  chat: "M4 5h16v11H9l-5 4V5Z",
  wallet: "M4 7h16v11H4V7Zm0 0 2-3h9l2 3M16 12h2",
  invoice: "M6 3h12v18l-3-2-3 2-3-2-3 2V3Zm3 5h6M9 12h6",
  tag: "M4 4h7l9 9-7 7-9-9V4Zm3.5 3.5h.01",
  card: "M3 6h18v12H3V6Zm0 4h18",
  robot: "M12 7V4M8 11h8M7 8h10v9H7V8Zm2 4h.01M15 12h.01",
  settings: "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm8.4 3-1.6-1a7 7 0 0 0 0-2l1.6-1-2-3.4-1.8.7a7 7 0 0 0-1.7-1L14 1h-4l-.9 1.9a7 7 0 0 0-1.7 1L5.6 3.2l-2 3.4 1.6 1a7 7 0 0 0 0 2l-1.6 1 2 3.4 1.8-.7a7 7 0 0 0 1.7 1L10 23h4l.9-1.9a7 7 0 0 0 1.7-1l1.8.7 2-3.4Z",
  users: "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0M17 11a3 3 0 0 0 0-6m5 15a5 5 0 0 0-4-5",
  log: "M5 4h14v16H5V4Zm3 4h8M8 12h8M8 16h5",
  external: "M14 4h6v6M20 4l-9 9M18 14v6H4V6h6",
  logout: "M15 4h4v16h-4M10 8l-4 4 4 4M6 12h9",
  plus: "M12 5v14M5 12h14",
  upload: "M12 15V4m0 0L8 8m4-4 4 4M5 20h14",
  menu: "M4 7h16M4 12h16M4 17h16",
  chevron: "m6 9 6 6 6-6",
  eye: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  bolt: "M13 2 4 14h7l-1 8 9-12h-7l1-8Z",
  check: "m5 13 4 4L19 7",
  alert: "M12 3 2 20h20L12 3Zm0 6v5m0 3h.01",
  sun: "M12 4V2m0 20v-2m8-8h2M2 12h2m13.7-5.7 1.4-1.4M4.9 19.1l1.4-1.4m0-11.4L4.9 4.9m14.2 14.2-1.4-1.4M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z",
};

export type IconName = keyof typeof P;

export function Icon({ name, size = 20, ...rest }: { name: IconName; size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden {...rest}>
      <path d={P[name]} />
    </svg>
  );
}
