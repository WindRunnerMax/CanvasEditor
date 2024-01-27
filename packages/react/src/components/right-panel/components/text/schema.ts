import type { SlateSchema } from "doc-editor-light";
import { DIVIDING_LINE_KEY } from "doc-editor-light";

export const schema: SlateSchema = {
  [DIVIDING_LINE_KEY]: {
    isVoid: true,
  },
};
