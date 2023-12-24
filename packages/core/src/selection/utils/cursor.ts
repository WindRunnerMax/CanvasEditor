import { OP_OFS } from "../../canvas/utils/constant";
import type { Editor } from "../../editor";
import { CURSOR_STATE, SELECT_BIAS } from "./constant";

export const setCursorState = (editor: Editor, e: MouseEvent) => {
  const selection = editor.selection.get();
  if (!selection) {
    editor.canvas.mask.setCursorState(null);
    return void 0;
  }
  let state: string = "";
  const { startX, startY, endX, endY } = selection;
  const { offsetX, offsetY } = e;
  // 需要判断是否在四个垂直/水平边界以及周边的四个大小为10，偏移为5的方块
  if (
    startX - SELECT_BIAS <= offsetX &&
    offsetX <= startX + SELECT_BIAS &&
    startY + OP_OFS <= offsetY &&
    offsetY <= endY - OP_OFS
  ) {
    state = CURSOR_STATE.L;
  } else if (
    endX - SELECT_BIAS <= offsetX &&
    offsetX <= endX + SELECT_BIAS &&
    startY + OP_OFS <= offsetY &&
    offsetY <= endY - OP_OFS
  ) {
    state = CURSOR_STATE.R;
  } else if (
    startX + OP_OFS <= offsetX &&
    offsetX <= endX - OP_OFS &&
    startY - SELECT_BIAS <= offsetY &&
    offsetY <= startY + SELECT_BIAS
  ) {
    state = CURSOR_STATE.T;
  } else if (
    startX + OP_OFS <= offsetX &&
    offsetX <= endX - OP_OFS &&
    endY - SELECT_BIAS <= offsetY &&
    offsetY <= endY + SELECT_BIAS
  ) {
    state = CURSOR_STATE.B;
  } else if (
    startX - OP_OFS <= offsetX &&
    offsetX <= startX + OP_OFS &&
    startY - OP_OFS <= offsetY &&
    offsetY <= startY + OP_OFS
  ) {
    state = CURSOR_STATE.LT;
  } else if (
    endX - OP_OFS <= offsetX &&
    offsetX <= endX + OP_OFS &&
    startY - OP_OFS <= offsetY &&
    offsetY <= startY + OP_OFS
  ) {
    state = CURSOR_STATE.RT;
  } else if (
    startX - OP_OFS <= offsetX &&
    offsetX <= startX + OP_OFS &&
    endY - OP_OFS <= offsetY &&
    offsetY <= endY + OP_OFS
  ) {
    state = CURSOR_STATE.LB;
  } else if (
    endX - OP_OFS <= offsetX &&
    offsetX <= endX + OP_OFS &&
    endY - OP_OFS <= offsetY &&
    offsetY <= endY + OP_OFS
  ) {
    state = CURSOR_STATE.RB;
  }
  editor.canvas.mask.setCursorState(state);
};
