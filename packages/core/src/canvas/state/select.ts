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
import {
  MAX_Z_INDEX,
  RESIZE_OFS,
  RESIZE_TYPE,
  SELECT_BIAS,
  THE_CONFIG,
  THE_DELAY,
} from "../utils/constant";
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
    this._z = MAX_Z_INDEX - 2;
    this.draggedRange = Range.from(0, 0);
    this.editor.event.on(EDITOR_EVENT.MOUSE_DOWN, this.onMouseDownController);
    this.editor.event.on(EDITOR_EVENT.SELECTION_CHANGE, this.onSelectionChange, 10);
    Object.keys(RESIZE_TYPE).forEach(key => {
      this.append(new ResizeNode(this.editor, key as ResizeType, this));
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
      const external = Range.from(-1, -1, -1, -1);
      this.setRange(external);
      this.children.forEach(node => node.setRange(external));
    }
    this.editor.logger.info("Selection Change", current);
    const range = current || previous;
    if (range) {
      // 按需刷新原选区与新选区的位置
      const refresh = range.compose(previous).compose(current);
      // COMPAT: `Range`需要加入偏移量
      this.editor.canvas.mask.drawingEffect(refresh.zoom(RESIZE_OFS));
    }
  };

  private onMouseDownController = (e: globalThis.MouseEvent) => {
    // 这里需要用原生事件绑定 需要在选区完成后再执行 否则交互上就必须要先点选再拖拽
    this.editor.event.off(EDITOR_EVENT.MOUSE_UP, this.onMouseUpController);
    this.editor.event.off(EDITOR_EVENT.MOUSE_MOVE, this.onMouseMoveController);
    // 选区 & 严格点击区域判定
    if (!this.editor.selection.get() || !this.isInSelectRange(Point.from(e), this.range)) {
      return void 0;
    }
    this.landing = Point.from(e);
    this.editor.event.on(EDITOR_EVENT.MOUSE_UP, this.onMouseUpController);
    this.editor.event.on(EDITOR_EVENT.MOUSE_MOVE, this.onMouseMoveController);
  };

  private onMouseMoveBridge = (e: globalThis.MouseEvent) => {
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
      this.setRange(latest);
      // 重绘拖拽过的最大区域
      this.draggedRange = this.draggedRange.compose(latest.zoom(RESIZE_OFS));
      this.editor.canvas.mask.drawingEffect(this.draggedRange);
    }
  };
  private onMouseMoveController = throttle(this.onMouseMoveBridge, THE_DELAY, THE_CONFIG);

  private onMouseUpController = () => {
    this.editor.event.off(EDITOR_EVENT.MOUSE_UP, this.onMouseUpController);
    this.editor.event.off(EDITOR_EVENT.MOUSE_MOVE, this.onMouseMoveController);
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
      this.editor.canvas.mask.drawingEffect(this.draggedRange);
    }
    this.landing = null;
    this.isDragging = false;
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

  private isInSelectRange = (point: Point, range: Range) => {
    // 严格判断点击区域 选区的`Range`需要排除八向占位
    const { startX, startY, endX, endY } = range.flat();
    const center = range.center();
    const { x, y } = point;
    const offset = RESIZE_OFS / 2;
    const startX1OFS = startX + RESIZE_OFS;
    const startY1OFS = startY + RESIZE_OFS;
    const endX0OFS = endX - RESIZE_OFS;
    const endY0OFS = endY - RESIZE_OFS;
    const startX1Offset = startX + offset;
    const endX0Offset = endX - offset;
    const startY1Offset = startY + offset;
    const endY0Offset = endY - offset;
    const centerY0OFS = center.y - RESIZE_OFS;
    const centerY1OFS = center.y + RESIZE_OFS;
    const centerX0OFS = center.x - RESIZE_OFS;
    const centerX1OFS = center.x + RESIZE_OFS;
    if (
      // `Range`范围内
      x >= startX &&
      x <= endX &&
      y >= startY &&
      y <= endY &&
      // 排除对角线向占位
      !(x <= startX1OFS && y <= startY1OFS) &&
      !(x >= endX0OFS && y <= startY1OFS) &&
      !(x <= startX1OFS && y >= endY0OFS) &&
      !(x >= endX0OFS && y >= endY0OFS) &&
      // 排除中心线向占位
      !(x <= startX1Offset && y >= centerY0OFS && y <= centerY1OFS) &&
      !(x >= endX0Offset && y >= centerY0OFS && y <= centerY1OFS) &&
      !(y <= startY1Offset && x >= centerX0OFS && x <= centerX1OFS) &&
      !(y >= endY0Offset && x >= centerX0OFS && x <= centerX1OFS)
    ) {
      return true;
    }
    return false;
  };
}
