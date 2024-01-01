import type { Editor } from "../../editor";
import { EDITOR_EVENT } from "../../event/bus/action";
import type { SelectionChangeEvent } from "../../event/bus/types";
import { Range } from "../../selection/range";
import { Node } from "../dom/node";
import { ResizeNode } from "../dom/resize";
import type { ResizeType } from "../utils/constant";
import { RESIZE_OFS, RESIZE_TYPE } from "../utils/constant";
import { BLUE } from "../utils/palette";
import { drawRect } from "../utils/shape";

export class SelectNode extends Node {
  constructor(private editor: Editor) {
    super(Range.from(0, 0));
    this.editor.event.on(EDITOR_EVENT.SELECTION_CHANGE, this.onSelectionChange);
    this.editor.event.on(EDITOR_EVENT.MOUSE_UP, this.onMouseUpController);
    Object.keys(RESIZE_TYPE).forEach(key => {
      this.append(new ResizeNode(this.editor, key as ResizeType));
    });
  }

  destroy() {
    this.editor.event.on(EDITOR_EVENT.MOUSE_UP, this.onMouseUpController);
    this.editor.event.off(EDITOR_EVENT.SELECTION_CHANGE, this.onSelectionChange);
  }

  protected onSelectionChange = (e: SelectionChangeEvent) => {
    const { current, previous } = e;
    if (current) {
      this.setRange(current);
      this.children.forEach(node => node.setRange(current));
    } else {
      this.setRange(Range.from(0, 0));
    }
    console.log("current :>> ", current);
    const range = current || previous;
    // `range`需要加入偏移量
    range && this.editor.canvas.mask.drawingRange(range.zoom(RESIZE_OFS));
  };

  public drawingMask = (ctx: CanvasRenderingContext2D) => {
    const selection = this.editor.selection.get();
    if (selection) {
      const { x, y, width, height } = selection.rect();
      drawRect(ctx, { x, y, width, height, borderColor: BLUE });
      this.children.forEach(node => node.drawingMask?.(ctx));
    }
  };

  private onMouseUpController = () => {
    this.editor.canvas.mask.setCursorState(null);
  };
}
