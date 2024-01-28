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
