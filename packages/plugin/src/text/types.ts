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
  ascent: number;
  descent: number;
};
export type TextMatrix = {
  config: Attributes;
  items: TextMatrixItem[];
  originHeight: number;
  height: number;
  width: number;
  offsetX: number;
  break?: boolean;
  lineHeight: number;
  ascent: number;
  descent: number;
};
export type TextMatrices = TextMatrix[];
