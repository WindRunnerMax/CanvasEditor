export const TEXT_ATTRS = {
  DATA: "data",
  FAMILY: "family",
  SIZE: "size",
  WEIGHT: "weight",
  STYLE: "style",
  COLOR: "color",
  BACKGROUND: "background",
  LINE_HEIGHT: "line-height",
};

export const COLOR_PEER: Record<string, string> = {
  "var(--color-white)": "#fff",
  "var(--color-black)": "#000",
  "rgb(var(--red-6))": "rgb(245,63,63)",
  "rgb(var(--blue-6))": "rgb(52,145,250)",
  "rgb(var(--green-6))": "rgb(0,180,42)",
  "rgb(var(--orange-6))": "rgb(255,125,0)",
  "rgb(var(--purple-6))": "rgb(114,46,209)",
  "rgb(var(--magenta-6))": "rgb(245,49,157)",
  "rgb(var(--pinkpurple-6))": "rgb(217,26,217)",
};

export type Attributes = Record<string, string>;

export type RichTextLine = {
  chars: { char: string; config: Attributes }[];
  config: Attributes;
};
export type RichTextLines = RichTextLine[];

export type TextMatrixItem = {
  char: string;
  font: string;
  metric: TextMetrics;
  config: Attributes;
};
export type TextMatrix = {
  items: TextMatrixItem[];
  height: number;
  width: number;
  break?: boolean;
};
export type TextMatrices = TextMatrix[];
