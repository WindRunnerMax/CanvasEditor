export const TEXT_ATTRS = {
  DATA: "data",
  FAMILY: "family",
  SIZE: "size",
  WEIGHT: "weight",
  STYLE: "style",
  COLOR: "color",
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
