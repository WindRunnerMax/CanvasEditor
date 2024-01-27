export const TEXT_ATTRS = {
  DATA: "DATA",
  ORIGIN_DATA: "ORIGIN_DATA",
  FAMILY: "FAMILY",
  SIZE: "SIZE",
  WEIGHT: "WEIGHT",
  STYLE: "STYLE",
  COLOR: "COLOR",
  UNDERLINE: "UNDERLINE",
  BACKGROUND: "BACKGROUND",
  LINE_HEIGHT: "LINE_HEIGHT",
  LINK: "LINK",
  STRIKE_THROUGH: "STRIKE_THROUGH",
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
  config: Attributes;
  width: number;
  height: number;
  descent: number;
};
export type TextMatrix = {
  items: TextMatrixItem[];
  height: number;
  width: number;
  break?: boolean;
};
export type TextMatrices = TextMatrix[];
