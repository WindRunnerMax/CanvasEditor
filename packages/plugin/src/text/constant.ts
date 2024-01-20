export const TEXT_ATTRS = {
  DATA: "data",
  FAMILY: "family",
  SIZE: "size",
  WEIGHT: "weight",
  STYLE: "style",
  COLOR: "color",
};

export type RichTextLine = {
  char: string;
  config: Record<string, string>;
}[];
export type RichTextLines = RichTextLine[];

export type TextMatrixItem = {
  char: string;
  font: string;
  metric: TextMetrics;
  config: Record<string, string>;
};
export type TextMatrix = {
  items: TextMatrixItem[];
  height: number;
  width: number;
  break?: boolean;
};
export type TextMatrices = TextMatrix[];
