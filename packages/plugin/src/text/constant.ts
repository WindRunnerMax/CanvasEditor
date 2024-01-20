export const TEXT_ATTRS = {
  DATA: "data",
  FAMILY: "family",
  SIZE: "size",
  WEIGHT: "weight",
  STYLE: "style",
};

export type TextLine = {
  char: string;
  config: Record<string, string>;
}[];
export type TextLines = TextLine[];

export type TextMatrixItem = {
  char: string;
  font: string;
  metric: TextMetrics;
};
export type TextMatrix = {
  items: TextMatrixItem[];
  height: number;
  width: number;
};
export type TextMatrices = TextMatrix[];
