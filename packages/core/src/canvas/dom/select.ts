import { Op, OP_TYPE } from "sketching-delta";
import { throttle } from "sketching-utils";

import type { Editor } from "../../editor";
import { EDITOR_EVENT } from "../../event/bus/action";
import type { SelectionChangeEvent } from "../../event/bus/types";
import { Point } from "../../selection/modules/point";
import { Range } from "../../selection/modules/range";
import type { ResizeType } from "../types/dom";
import { MAX_Z_INDEX, RESIZE_OFS, RESIZE_TYPE, SELECT_BIAS, THE_DELAY } from "../utils/constant";
import { BLUE_5 } from "../utils/palette";
import { drawRect } from "../utils/shape";
import { Node } from "./node";
import { ReferNode } from "./refer";
import { ResizeNode } from "./resize";

export class SelectNode extends Node {
  private _isDragging: boolean;
  private landing: Point | null;
  private dragged: Range | null;
  public readonly refer: ReferNode;

  constructor(private editor: Editor) {
    super(Range.reset());
    this.landing = null;
    this.dragged = null;
    this._isDragging = false;
    this._z = MAX_Z_INDEX - 2;
    this.refer = new ReferNode(this.editor);
    this.editor.event.on(EDITOR_EVENT.MOUSE_DOWN, this.onMouseDownController);
    this.editor.event.on(EDITOR_EVENT.SELECTION_CHANGE, this.onSelectionChange, 10);
    Object.keys(RESIZE_TYPE).forEach(key => {
      this.append(new ResizeNode(this.editor, key as ResizeType, this));
    });
    this.append(this.refer);
  }

  destroy() {
    this.editor.event.off(EDITOR_EVENT.MOUSE_DOWN, this.onMouseDownController);
    this.editor.event.off(EDITOR_EVENT.SELECTION_CHANGE, this.onSelectionChange);
  }

  public get isDragging() {
    return this._isDragging;
  }

  protected onSelectionChange = (e: SelectionChangeEvent) => {
    const { current, previous } = e;
    if (current) {
      this.setRange(current);
      this.children.forEach(node => node.setRange(current));
    } else {
      const empty = Range.reset();
      this.setRange(empty);
      this.children.forEach(node => node.setRange(empty));
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

  private bindOpEvents = () => {
    this.editor.event.on(EDITOR_EVENT.MOUSE_UP_GLOBAL, this.onMouseUpController);
    this.editor.event.on(EDITOR_EVENT.MOUSE_MOVE_GLOBAL, this.onMouseMoveController);
  };

  private unbindOpEvents = () => {
    this.editor.event.off(EDITOR_EVENT.MOUSE_UP_GLOBAL, this.onMouseUpController);
    this.editor.event.off(EDITOR_EVENT.MOUSE_MOVE_GLOBAL, this.onMouseMoveController);
  };

  private onMouseDownController = (e: globalThis.MouseEvent) => {
    this.unbindOpEvents();
    const selection = this.editor.selection.get();
    // 这里需要用原生事件绑定 需要在选区完成后再执行 否则交互上就必须要先点选再拖拽
    // 选区 & 严格点击区域判定
    if (!selection || !this.isInSelectRange(Point.from(e, this.editor), this.range)) {
      return void 0;
    }
    this.dragged = selection;
    this.landing = Point.from(e.clientX, e.clientY);
    this.bindOpEvents();
    this.refer.onMouseDownController();
  };

  private onMouseMoveBasic = (e: globalThis.MouseEvent) => {
    const selection = this.editor.selection.get();
    if (!this.landing || !selection) return void 0;
    const point = Point.from(e.clientX, e.clientY);
    const { x, y } = this.landing.diff(point);
    if (!this._isDragging && (Math.abs(x) > SELECT_BIAS || Math.abs(y) > SELECT_BIAS)) {
      // 拖拽阈值
      this._isDragging = true;
    }
    if (this._isDragging && selection) {
      const latest = selection.move(x, y);
      const zoomed = latest.zoom(RESIZE_OFS);
      // 重绘拖拽过的最大区域
      this.dragged = this.dragged ? this.dragged.compose(zoomed) : zoomed;
      this.editor.canvas.mask.drawingEffect(this.dragged);
      const offset = this.refer.onMouseMoveController(latest);
      this.setRange(offset ? latest.move(offset.x, offset.y) : latest);
    }
  };
  private onMouseMoveController = throttle(this.onMouseMoveBasic, THE_DELAY);

  private onMouseUpController = () => {
    this.unbindOpEvents();
    this.refer.onMouseUpController();
    const selection = this.editor.selection.get();
    if (this._isDragging && selection) {
      const rect = this.range;
      const { startX, startY } = selection.flat();
      this.editor.state.apply(
        new Op(OP_TYPE.MOVE, { x: rect.start.x - startX, y: rect.start.y - startY })
      );
      this.editor.selection.set(rect);
      this.dragged && this.editor.canvas.mask.drawingEffect(this.dragged);
    }
    this.landing = null;
    this.dragged = null;
    this._isDragging = false;
  };

  public drawingMask = (ctx: CanvasRenderingContext2D) => {
    const selection = this.editor.selection.get();
    if (this._isDragging) {
      const { x, y, width, height } = this.range.rect();
      drawRect(ctx, { x, y, width, height, borderColor: BLUE_5 });
    }
    if (selection) {
      const { x, y, width, height } = selection.rect();
      drawRect(ctx, { x, y, width, height, borderColor: BLUE_5 });
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
