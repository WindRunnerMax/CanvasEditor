import { OP_OFS } from "../../canvas/utils/constant";
import type { Editor } from "../../editor";
import { RESIZE_TYPE, SELECT_BIAS, SELECTION_STATE } from "./constant";

export const setCursorState = (editor: Editor, e: MouseEvent) => {
  const selection = editor.selection.get();
  if (!selection) {
    editor.selection.setState(SELECTION_STATE.RESIZE, null);
    return null;
  }
  let state: RESIZE_TYPE | null = null;
  const { startX, startY, endX, endY } = selection;
  const { offsetX, offsetY } = e;
  if (
    Math.abs(startX - offsetX) <= SELECT_BIAS &&
    startY + OP_OFS <= offsetY &&
    offsetY <= endY - OP_OFS
  ) {
    state = RESIZE_TYPE.L;
  } else if (
    endX - SELECT_BIAS <= offsetX &&
    offsetX <= endX + SELECT_BIAS &&
    startY + OP_OFS <= offsetY &&
    offsetY <= endY - OP_OFS
  ) {
    state = RESIZE_TYPE.R;
  } else if (
    startX + OP_OFS <= offsetX &&
    offsetX <= endX - OP_OFS &&
    startY - SELECT_BIAS <= offsetY &&
    offsetY <= startY + SELECT_BIAS
  ) {
    state = RESIZE_TYPE.T;
  } else if (
    startX + OP_OFS <= offsetX &&
    offsetX <= endX - OP_OFS &&
    endY - SELECT_BIAS <= offsetY &&
    offsetY <= endY + SELECT_BIAS
  ) {
    state = RESIZE_TYPE.B;
  } else if (
    startX - OP_OFS <= offsetX &&
    offsetX <= startX + OP_OFS &&
    startY - OP_OFS <= offsetY &&
    offsetY <= startY + OP_OFS
  ) {
    state = RESIZE_TYPE.LT;
  } else if (
    endX - OP_OFS <= offsetX &&
    offsetX <= endX + OP_OFS &&
    startY - OP_OFS <= offsetY &&
    offsetY <= startY + OP_OFS
  ) {
    state = RESIZE_TYPE.RT;
  } else if (
    startX - OP_OFS <= offsetX &&
    offsetX <= startX + OP_OFS &&
    endY - OP_OFS <= offsetY &&
    offsetY <= endY + OP_OFS
  ) {
    state = RESIZE_TYPE.LB;
  } else if (
    endX - OP_OFS <= offsetX &&
    offsetX <= endX + OP_OFS &&
    endY - OP_OFS <= offsetY &&
    offsetY <= endY + OP_OFS
  ) {
    state = RESIZE_TYPE.RB;
  }
  editor.selection.setState(SELECTION_STATE.RESIZE, state);
  return state;
};
