import type { Editor } from "../../editor";

export const isInsideDelta = (editor: Editor, offsetX: number, offsetY: number) => {
  const deltas = Object.values(editor.deltaSet.getDeltas()).reverse();
  for (const delta of deltas) {
    const { x, y, width, height } = delta;
    if (offsetX >= x && offsetX <= x + width && offsetY >= y && offsetY <= y + height) {
      return delta;
    }
  }
  return null;
};
