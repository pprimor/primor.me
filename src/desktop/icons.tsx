import type { ReactNode } from "react";

/** 32×32 pixel-art icons drawn from rects so they stay crisp at any size. */
function Pixels({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width="32"
      height="32"
      shapeRendering="crispEdges"
      aria-hidden="true"
      className="h-8 w-8 drop-shadow-[1px_1px_0_rgba(0,0,0,0.5)]"
    >
      {children}
    </svg>
  );
}

type R = [x: number, y: number, w: number, h: number, fill: string];

function rects(list: R[]) {
  return list.map(([x, y, w, h, fill], i) => (
    <rect key={i} x={x} y={y} width={w} height={h} fill={fill} />
  ));
}

export function TerminalIcon() {
  return (
    <Pixels>
      {rects([
        [2, 3, 28, 21, "#1f1f1f"],
        [3, 4, 26, 19, "#c0c0c0"],
        [5, 6, 22, 15, "#0d1117"],
        [7, 8, 2, 2, "#3fb950"],
        [9, 10, 2, 2, "#3fb950"],
        [7, 12, 2, 2, "#3fb950"],
        [13, 12, 6, 2, "#3fb950"],
        [12, 24, 8, 2, "#808080"],
        [8, 26, 16, 3, "#c0c0c0"],
        [8, 28, 16, 1, "#1f1f1f"],
      ])}
    </Pixels>
  );
}

export function DocumentIcon() {
  return (
    <Pixels>
      {rects([
        [6, 2, 16, 28, "#1f1f1f"],
        [7, 3, 14, 26, "#ffffff"],
        [21, 8, 5, 22, "#1f1f1f"],
        [21, 9, 4, 20, "#ffffff"],
        [20, 2, 2, 2, "#1f1f1f"],
        [22, 4, 2, 2, "#1f1f1f"],
        [24, 6, 2, 2, "#1f1f1f"],
        [20, 4, 2, 4, "#c0c0c0"],
        [22, 6, 2, 2, "#c0c0c0"],
        [10, 9, 9, 1, "#808080"],
        [10, 12, 12, 1, "#808080"],
        [10, 15, 12, 1, "#808080"],
        [10, 18, 8, 1, "#808080"],
        [4, 21, 17, 7, "#c0392b"],
        [6, 23, 2, 3, "#ffffff"],
        [8, 23, 1, 1, "#ffffff"],
        [11, 23, 2, 3, "#ffffff"],
        [13, 24, 1, 1, "#ffffff"],
        [16, 23, 3, 1, "#ffffff"],
        [16, 24, 1, 2, "#ffffff"],
      ])}
    </Pixels>
  );
}

export function FolderIcon() {
  return (
    <Pixels>
      {rects([
        [3, 7, 11, 4, "#1f1f1f"],
        [4, 8, 9, 3, "#f4d27a"],
        [3, 10, 26, 18, "#1f1f1f"],
        [4, 11, 24, 16, "#e8b63c"],
        [4, 11, 24, 2, "#f4d27a"],
        [11, 17, 3, 1, "#1f1f1f"],
        [10, 18, 1, 1, "#1f1f1f"],
        [11, 19, 3, 1, "#1f1f1f"],
        [18, 17, 3, 1, "#1f1f1f"],
        [21, 18, 1, 1, "#1f1f1f"],
        [18, 19, 3, 1, "#1f1f1f"],
      ])}
    </Pixels>
  );
}

export function CardIcon() {
  return (
    <Pixels>
      {rects([
        [3, 5, 26, 22, "#1f1f1f"],
        [4, 6, 24, 20, "#1d5fa8"],
        [8, 10, 3, 3, "#ffffff"],
        [8, 15, 3, 8, "#ffffff"],
        [14, 15, 3, 8, "#ffffff"],
        [17, 15, 5, 3, "#ffffff"],
        [21, 17, 3, 6, "#ffffff"],
      ])}
    </Pixels>
  );
}

export function MailIcon() {
  return (
    <Pixels>
      {rects([
        [2, 7, 28, 19, "#1f1f1f"],
        [3, 8, 26, 17, "#ffffff"],
        [4, 9, 2, 2, "#808080"],
        [6, 11, 2, 2, "#808080"],
        [8, 13, 2, 2, "#808080"],
        [10, 15, 2, 2, "#808080"],
        [12, 17, 8, 2, "#808080"],
        [20, 15, 2, 2, "#808080"],
        [22, 13, 2, 2, "#808080"],
        [24, 11, 2, 2, "#808080"],
        [26, 9, 2, 2, "#808080"],
        [22, 20, 6, 3, "#c0392b"],
      ])}
    </Pixels>
  );
}

export function BriefcaseIcon() {
  return (
    <Pixels>
      {rects([
        [11, 4, 10, 2, "#1f1f1f"],
        [11, 6, 2, 4, "#1f1f1f"],
        [19, 6, 2, 4, "#1f1f1f"],
        [2, 9, 28, 19, "#1f1f1f"],
        [3, 10, 26, 17, "#8b5a2b"],
        [3, 10, 26, 2, "#a8743f"],
        [3, 17, 26, 1, "#5c3a1a"],
        [14, 15, 4, 5, "#1f1f1f"],
        [15, 16, 2, 3, "#e8b63c"],
      ])}
    </Pixels>
  );
}

/** A generic app window, its title band in the host's colour. */
export function HostIcon({ color }: { color: string }) {
  return (
    <Pixels>
      {rects([
        [3, 4, 26, 22, "#1f1f1f"],
        [4, 5, 24, 20, "#c0c0c0"],
        [4, 5, 24, 5, color],
        [7, 13, 18, 2, "#808080"],
        [7, 17, 12, 2, "#808080"],
      ])}
    </Pixels>
  );
}
