import type { Editor } from "../../editor";
import type { Range } from "../../selection/range";
import { SELECT_BIAS } from "./constant";

export const isInsideDelta = (editor: Editor, offsetX: number, offsetY: number) => {
  const deltas = Object.values(editor.deltaSet.getDeltas()).reverse();
  for (const delta of deltas) {
    const { x, y, width, height } = delta;
    if (
      offsetX >= x - SELECT_BIAS &&
      offsetX <= x + width + SELECT_BIAS &&
      offsetY >= y - SELECT_BIAS &&
      offsetY <= y + height + SELECT_BIAS
    ) {
      return delta;
    }
  }
  return null;
};

export const isPointInRange = (offsetX: number, offsetY: number, range: Range) => {
  const { startX, startY, endX, endY } = range.flat();
  if (offsetX >= startX && offsetX <= endX && offsetY >= startY && offsetY <= endY) {
    return true;
  }
  return false;
};
