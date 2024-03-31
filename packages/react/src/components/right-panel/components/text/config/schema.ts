import type { EditorSchema } from "doc-editor-core";
import { DIVIDING_LINE_KEY } from "doc-editor-plugin";

export const schema: EditorSchema = {
  [DIVIDING_LINE_KEY]: {
    void: true,
  },
};
