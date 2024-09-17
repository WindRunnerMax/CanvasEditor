import { Op, OP_TYPE } from "sketching-delta";
import { BLUE_6, throttle } from "sketching-utils";

import type { Editor } from "../../editor";
import { EDITOR_EVENT } from "../../event/bus/action";
import type { SelectionChangeEvent } from "../../event/bus/types";
import { Point } from "../../selection/modules/point";
import { Range } from "../../selection/modules/range";
import type { ResizeType } from "../types/dom";
import { MAX_Z_INDEX, RESIZE_OFS, RESIZE_TYPE, SELECT_BIAS, THE_CONFIG } from "../utils/constant";
import { Shape } from "../utils/shape";
import { Node } from "./node";
import { ReferNode } from "./refer";
import { ResizeNode } from "./resize";

export class SelectNode extends Node {
  /** 拖拽标识 */
  private _isDragging: boolean;
  /** 拖拽点击落点 */
  private landing: Point | null;
  /** 上次绘制区域 */
  private dragged: Range | null;
  /** 参考线模块引用 */
  public readonly refer: ReferNode;

  constructor(private editor: Editor) {
    super(Range.reset());
    this.landing = null;
    this.dragged = null;
    this._isDragging = false;
    this._z = MAX_Z_INDEX - 2;
    this.refer = new ReferNode(this.editor);
    // COMPAT: 这里需要用原生事件绑定 而非编辑器分发事件
    // 事件需要在选区完成后再执行 否则交互上就必须要先点选再拖拽
    this.editor.event.on(EDITOR_EVENT.MOUSE_DOWN, this.onMouseDownController);
    this.editor.event.on(EDITOR_EVENT.SELECTION_CHANGE, this.onSelectionChange, 10);
    Object.keys(RESIZE_TYPE).forEach(key => {
      const resizeNode = new ResizeNode(this.editor, key as ResizeType, this);
      resizeNode.setIgnoreEvent(true);
      this.append(resizeNode);
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
      this.children.forEach(node => {
        node.setRange(current);
        node.setIgnoreEvent(false);
      });
    } else {
      const empty = Range.reset();
      this.setRange(empty);
      this.children.forEach(node => {
        node.setRange(empty);
        node.setIgnoreEvent(true);
      });
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

  /**
   * 绑定拖拽事件的触发器
   */
  private bindDragEvents = () => {
    this.editor.event.on(EDITOR_EVENT.MOUSE_UP_GLOBAL, this.onMouseUpController);
    this.editor.event.on(EDITOR_EVENT.MOUSE_MOVE_GLOBAL, this.onMouseMoveController);
  };

  /**
   * 取消拖拽事件的触发器
   */
  private unbindDragEvents = () => {
    this.editor.event.off(EDITOR_EVENT.MOUSE_UP_GLOBAL, this.onMouseUpController);
    this.editor.event.off(EDITOR_EVENT.MOUSE_MOVE_GLOBAL, this.onMouseMoveController);
  };

  private onMouseDownController = (e: globalThis.MouseEvent) => {
    // 非默认状态下不执行事件
    if (!this.editor.canvas.isDefaultMode()) return void 0;
    // 取消已有事件绑定
    this.unbindDragEvents();
    const selection = this.editor.selection.get();
    // 选区 & 严格点击区域判定
    if (!selection || !this.isInSelectRange(Point.from(e, this.editor), this.range)) {
      return void 0;
    }
    this.dragged = selection;
    this.landing = Point.from(e.clientX, e.clientY);
    this.bindDragEvents();
    this.refer.onMouseDownController();
  };

  private onMouseMoveBasic = (e: globalThis.MouseEvent) => {
    const selection = this.editor.selection.get();
    if (!this.landing || !selection) return void 0;
    const point = Point.from(e.clientX, e.clientY);
    const { x, y } = this.landing.diff(point);
    // 超过阈值才认为正在触发拖拽
    if (!this._isDragging && (Math.abs(x) > SELECT_BIAS || Math.abs(y) > SELECT_BIAS)) {
      this._isDragging = true;
    }
    if (this._isDragging && selection) {
      // 获取上次绘制的选区位置
      const prev = this.dragged || selection;
      const latest = selection.move(x, y);
      this.dragged = latest;
      // 重绘上次绘制到本次绘制的组合区域
      const zoomed = latest.compose(prev).zoom(RESIZE_OFS);
      this.editor.canvas.mask.drawingEffect(zoomed);
      const offset = this.refer.onMouseMoveController(latest);
      this.setRange(offset ? latest.move(offset.x, offset.y) : latest);
    }
  };
  private onMouseMoveController = throttle(this.onMouseMoveBasic, ...THE_CONFIG);

  private onMouseUpController = () => {
    this.unbindDragEvents();
    this.refer.onMouseUpController();
    const selection = this.editor.selection.get();
    if (this._isDragging && selection) {
      const rect = this.range;
      const { startX, startY } = selection.flat();
      const ids = [...this.editor.selection.getActiveDeltaIds()];
      this.editor.state.apply(
        new Op(OP_TYPE.MOVE, { ids, x: rect.start.x - startX, y: rect.start.y - startY })
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
      Shape.frame(ctx, { x, y, width, height, borderColor: BLUE_6 });
    }
    if (selection) {
      const { x, y, width, height } = selection.rect();
      Shape.frame(ctx, { x, y, width, height, borderColor: BLUE_6 });
      // COMPAT: 实际上内部的 Resize Children 节点会被 DrawEffects 调度
      // 但是会偶现渲染顺序不一致导致覆盖的问题 因此依然主动调度渲染
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
