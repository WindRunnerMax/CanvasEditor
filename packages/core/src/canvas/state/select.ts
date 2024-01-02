import { Op, OP_TYPE } from "sketching-delta";
import { throttle } from "sketching-utils";

import type { Editor } from "../../editor";
import { EDITOR_EVENT } from "../../event/bus/action";
import type { SelectionChangeEvent } from "../../event/bus/types";
import { Point } from "../../selection/point";
import { Range } from "../../selection/range";
import { Node } from "../dom/node";
import { ResizeNode } from "../dom/resize";
import type { ResizeType } from "../utils/constant";
import { RESIZE_OFS, RESIZE_TYPE, SELECT_BIAS } from "../utils/constant";
import { BLUE } from "../utils/palette";
import { drawRect } from "../utils/shape";

export class SelectNode extends Node {
  private landing: Point | null;
  private draggedRange: Range;
  private isDragging: boolean;
  constructor(private editor: Editor) {
    super(Range.from(0, 0));
    this.landing = null;
    this.isDragging = false;
    this.draggedRange = Range.from(0, 0);
    this.editor.event.on(EDITOR_EVENT.SELECTION_CHANGE, this.onSelectionChange);
    this.editor.event.on(EDITOR_EVENT.MOUSE_DOWN, this.onMouseDownController);
    Object.keys(RESIZE_TYPE).forEach(key => {
      this.append(new ResizeNode(this.editor, key as ResizeType));
    });
  }

  destroy() {
    this.editor.event.off(EDITOR_EVENT.MOUSE_DOWN, this.onMouseDownController);
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
    // COMPAT: `Range`需要加入偏移量
    range && this.editor.canvas.mask.drawingRange(range.zoom(RESIZE_OFS));
  };

  private onMouseDownController = (e: globalThis.MouseEvent) => {
    this.editor.event.off(EDITOR_EVENT.MOUSE_MOVE, this.onMouseMoveController);
    this.editor.event.off(EDITOR_EVENT.MOUSE_UP, this.onMouseUpController);
    // TODO: 点击区域判定
    this.landing = Point.from(e);
    this.editor.event.on(EDITOR_EVENT.MOUSE_MOVE, this.onMouseMoveController);
    this.editor.event.on(EDITOR_EVENT.MOUSE_UP, this.onMouseUpController);
  };

  private onMouseMoveController = throttle(
    (e: globalThis.MouseEvent) => {
      const selection = this.editor.selection.get();
      if (!this.landing || !selection) return void 0;
      const point = Point.from(e);
      const { x, y } = this.landing.diff(point);
      if (!this.isDragging && (Math.abs(x) > SELECT_BIAS || Math.abs(y) > SELECT_BIAS)) {
        this.isDragging = true;
      }
      if (this.isDragging && selection) {
        const { startX, startY, endX, endY } = selection.flat();
        const latest = new Range({
          startX: startX + x,
          startY: startY + y,
          endX: endX + x,
          endY: endY + y,
        });
        // 重绘拖拽过的最大区域
        this.draggedRange = this.draggedRange.compose(latest.zoom(RESIZE_OFS));
        this.setRange(latest);
        this.editor.canvas.mask.drawingRange(this.draggedRange);
      }
    },
    30,
    { trailing: true }
  );

  private onMouseUpController = () => {
    this.editor.event.off(EDITOR_EVENT.MOUSE_MOVE, this.onMouseMoveController);
    this.editor.event.off(EDITOR_EVENT.MOUSE_UP, this.onMouseUpController);
    this.landing = null;
    if (this.isDragging) {
      const selection = this.editor.selection.get();
      const rect = this.range;
      if (selection) {
        const { startX, startY } = selection.flat();
        this.editor.state.apply(
          new Op(OP_TYPE.MOVE, {
            x: rect.start.x - startX,
            y: rect.start.y - startY,
          })
        );
        this.editor.selection.set(rect);
      }
    }
    this.isDragging = false;
    this.editor.canvas.mask.setCursorState(null);
    this.editor.canvas.mask.drawingRange(this.draggedRange);
  };

  public drawingMask = (ctx: CanvasRenderingContext2D) => {
    const selection = this.editor.selection.get();
    if (this.isDragging) {
      const { x, y, width, height } = this.range.rect();
      drawRect(ctx, { x, y, width, height, borderColor: BLUE });
    }
    if (selection) {
      const { x, y, width, height } = selection.rect();
      drawRect(ctx, { x, y, width, height, borderColor: BLUE });
      this.children.forEach(node => node.drawingMask?.(ctx));
    }
  };
}
