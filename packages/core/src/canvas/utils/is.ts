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

export const isRangeIntersect = (range1: Range, range2: Range) => {
  const { startX: startX1, startY: startY1, endX: endX1, endY: endY1 } = range1.flat();
  const { startX: startX2, startY: startY2, endX: endX2, endY: endY2 } = range2.flat();
  // 两个矩形相交 水平方向和垂直方向都相交
  if (startX1 <= endX2 && endX1 >= startX2 && startY1 <= endY2 && endY1 >= startY2) {
    return true;
  }
  return false;
};
