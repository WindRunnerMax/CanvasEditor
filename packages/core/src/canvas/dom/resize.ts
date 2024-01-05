import { throttle } from "sketching-utils";

import type { Editor } from "../../editor";
import { EDITOR_EVENT } from "../../event/bus/action";
import { Point } from "../../selection/point";
import { Range } from "../../selection/range";
import { EDITOR_STATE } from "../../state/utils/constant";
import type { ResizeType } from "../utils/constant";
import {
  MAX_Z_INDEX,
  RESIZE_LEN,
  RESIZE_OFS,
  RESIZE_TYPE,
  SELECT_BIAS,
  THE_CONFIG,
  THE_DELAY,
} from "../utils/constant";
import { DEEP_GRAY, GRAY, WHITE } from "../utils/palette";
import { drawArc, drawRect } from "../utils/shape";
import type { MouseEvent } from "./event";
import { Node } from "./node";

export class ResizeNode extends Node {
  private type: ResizeType;
  private isDragging: boolean;
  private latest: Range | null;
  private landing: Point | null;
  private landingRange: Range | null;

  constructor(private editor: Editor, type: ResizeType, parent: Node) {
    super(Range.from(-1, -1, -1, -1));
    this.type = type;
    this.latest = null;
    this.landing = null;
    this.setParent(parent);
    this.isDragging = false;
    this.landingRange = null;
    this._z = MAX_Z_INDEX - 1;
  }

  public setRange = (range: Range) => {
    const { startX, startY, endX, endY } = range.flat();
    if (range.isOutside()) {
      super.setRange(range);
      return void 0;
    }
    let target = Range.from(0, 0);
    switch (this.type) {
      case RESIZE_TYPE.LT: {
        const range = Range.from(startX, startY, startX + RESIZE_LEN, startY + RESIZE_LEN);
        target = range.move(-RESIZE_OFS, -RESIZE_OFS);
        break;
      }
      case RESIZE_TYPE.RT: {
        const range = Range.from(endX, startY, endX + RESIZE_LEN, startY + RESIZE_LEN);
        target = range.move(-RESIZE_OFS, -RESIZE_OFS);
        break;
      }
      case RESIZE_TYPE.LB: {
        const range = Range.from(startX, endY, startX + RESIZE_LEN, endY + RESIZE_LEN);
        target = range.move(-RESIZE_OFS, -RESIZE_OFS);
        break;
      }
      case RESIZE_TYPE.RB: {
        const range = Range.from(endX, endY, endX + RESIZE_LEN, endY + RESIZE_LEN);
        target = range.move(-RESIZE_OFS, -RESIZE_OFS);
        break;
      }
      case RESIZE_TYPE.L: {
        const range = Range.from(startX, startY, startX, endY);
        const { x, y } = range.center();
        const offset = RESIZE_OFS / 2;
        target = Range.from(x - offset, y - RESIZE_OFS, x + offset, y + RESIZE_OFS);
        break;
      }
      case RESIZE_TYPE.R: {
        const range = Range.from(endX, startY, endX, endY);
        const { x, y } = range.center();
        const offset = RESIZE_OFS / 2;
        target = Range.from(x - offset, y - RESIZE_OFS, x + offset, y + RESIZE_OFS);
        break;
      }
      case RESIZE_TYPE.T: {
        const range = Range.from(startX, startY, endX, startY);
        const { x, y } = range.center();
        const offset = RESIZE_OFS / 2;
        target = Range.from(x - RESIZE_OFS, y - offset, x + RESIZE_OFS, y + offset);
        break;
      }
      case RESIZE_TYPE.B: {
        const range = Range.from(startX, endY, endX, endY);
        const { x, y } = range.center();
        const offset = RESIZE_OFS / 2;
        target = Range.from(x - RESIZE_OFS, y - offset, x + RESIZE_OFS, y + offset);
        break;
      }
    }
    super.setRange(target);
  };

  protected onMouseEnter = (e: MouseEvent) => {
    if (!this.editor.selection.get() || this.editor.state.get(EDITOR_STATE.MOUSE_DOWN)) {
      return void 0;
    }
    this.setCursorState(Point.from(e.x, e.y));
  };

  protected onMouseLeave = () => {
    if (this.editor.state.get(EDITOR_STATE.MOUSE_DOWN)) return void 0;
    this.editor.canvas.mask.setCursorState(null);
  };

  private temp = new Map<string, { width: number; height: number; x: number; y: number }>();
  protected onMouseDown = (e: MouseEvent) => {
    this.editor.event.off(EDITOR_EVENT.MOUSE_UP, this.onMouseUpController);
    this.editor.event.off(EDITOR_EVENT.MOUSE_MOVE, this.onMouseMoveController);
    const selection = this.editor.selection.get();
    if (!selection || !this.parent) {
      return void 0;
    }
    this.landingRange = selection;
    this.landing = Point.from(e.x, e.y);
    //////
    const ids = this.editor.selection.getActiveDeltas();
    ids.forEach(id => {
      const state = this.editor.state.getDeltaState(id);
      if (!state) return void 0;
      const delta = state.delta;
      const { width, height, x, y } = delta.getRect();
      this.temp.set(id, { width, height, x, y });
    });
    //////
    this.editor.event.on(EDITOR_EVENT.MOUSE_UP, this.onMouseUpController);
    this.editor.event.on(EDITOR_EVENT.MOUSE_MOVE, this.onMouseMoveController);
  };

  private onMouseMoveBridge = (e: globalThis.MouseEvent) => {
    const selection = this.editor.selection.get();
    if (!this.landing || !selection || !this.landingRange || !this.parent) return void 0;
    const point = Point.from(e);
    const { x, y } = this.landing.diff(point);
    if (!this.isDragging && (Math.abs(x) > SELECT_BIAS || Math.abs(y) > SELECT_BIAS)) {
      this.isDragging = true;
    }
    if (this.isDragging && selection) {
      let formattedX = x;
      let formattedY = y;
      const { width, height } = this.landingRange.rect();
      const ratio = width / height;
      const { startX, startY, endX, endY } = this.landingRange.flat();
      let latest = Range.from(0, 0);
      switch (this.type) {
        case RESIZE_TYPE.LT: {
          if (e.shiftKey) {
            formattedX = formattedY * ratio;
            formattedY = formattedX / ratio;
          }
          latest = Range.from(startX + formattedX, startY + formattedY, endX, endY);
          break;
        }
        case RESIZE_TYPE.RT: {
          if (e.shiftKey) {
            formattedX = -formattedY * ratio;
            formattedY = -formattedX / ratio;
          }
          latest = Range.from(startX, startY + formattedY, endX + formattedX, endY);
          break;
        }
        case RESIZE_TYPE.LB: {
          if (e.shiftKey) {
            formattedX = -formattedY * ratio;
            formattedY = -formattedX / ratio;
          }
          latest = Range.from(startX + formattedX, startY, endX, endY + formattedY);
          break;
        }
        case RESIZE_TYPE.RB: {
          if (e.shiftKey) {
            formattedX = formattedY * ratio;
            formattedY = formattedX / ratio;
          }
          latest = Range.from(startX, startY, endX + formattedX, endY + formattedY);
          break;
        }
        case RESIZE_TYPE.L: {
          latest = Range.from(startX + x, startY, endX, endY);
          break;
        }
        case RESIZE_TYPE.R: {
          latest = Range.from(startX, startY, endX + x, endY);
          break;
        }
        case RESIZE_TYPE.T: {
          latest = Range.from(startX, startY + y, endX, endY);
          break;
        }
        case RESIZE_TYPE.B: {
          latest = Range.from(startX, startY, endX, endY + y);
          break;
        }
      }
      this.latest = latest.normalize();
      this.editor.selection.set(this.latest);
      ///////
      // 根据位置将选中的图形大小进行调整
      const ids = this.editor.selection.getActiveDeltas();
      // 需要根据新旧选区调整包含的每个图形的大小和位置
      const { width: oldWidth, height: oldHeight, x: oldX, y: oldY } = this.landingRange.rect();
      const { width: newWidth, height: newHeight } = this.latest.rect();
      const ratioX = newWidth / oldWidth;
      const ratioY = newHeight / oldHeight;
      console.log("ratio :>> ", ratioX, ratioY, newWidth);
      const temp = this.temp;
      ids.forEach(id => {
        const state = this.editor.state.getDeltaState(id);
        const data = temp.get(id);
        if (!state || !data) return void 0;
        const { width, height, x, y } = data;
        const delta = state.delta;
        delta.setX((x - oldX) * ratioX + oldX);
        delta.setY((y - oldY) * ratioY + oldY);
        delta.setWidth(width * ratioX);
        delta.setHeight(height * ratioY);
      });
      this.editor.canvas.graph.drawingAll();
      ///////
    }
  };
  private onMouseMoveController = throttle(this.onMouseMoveBridge, THE_DELAY, THE_CONFIG);

  private onMouseUpController = (e: globalThis.MouseEvent) => {
    this.editor.event.off(EDITOR_EVENT.MOUSE_UP, this.onMouseUpController);
    this.editor.event.off(EDITOR_EVENT.MOUSE_MOVE, this.onMouseMoveController);
    if (this.isDragging && this.latest && this.parent) {
      const point = Point.from(e);
      const latest = this.latest;
      this.editor.canvas.mask.setCursorState(null);
      // 根据点位调整`Resize`节点位置
      this.parent.children.forEach(node => {
        node.setRange(latest);
        node instanceof ResizeNode && node.setCursorState(point);
      });
    }
    this.latest = null;
    this.landing = null;
    this.isDragging = false;
    this.landingRange = null;
  };

  public setCursorState = (point: Point) => {
    if (point.in(this.range)) {
      this.editor.canvas.mask.setCursorState(this.type);
    }
  };

  public drawingMask = (ctx: CanvasRenderingContext2D) => {
    if (!this.editor.selection.get()) return void 0;
    const range = this.range;
    const { x, y } = range.center();
    const fillColor = WHITE;
    const borderWidth = 1;
    const radius = RESIZE_LEN / 2;
    switch (this.type) {
      case RESIZE_TYPE.LB:
      case RESIZE_TYPE.LT:
      case RESIZE_TYPE.RB:
      case RESIZE_TYPE.RT:
        drawArc(ctx, { x, y, borderColor: DEEP_GRAY, fillColor, radius, borderWidth });
        break;
      case RESIZE_TYPE.B:
      case RESIZE_TYPE.R:
      case RESIZE_TYPE.T:
      case RESIZE_TYPE.L:
        drawRect(ctx, { ...range.rect(), fillColor, borderColor: GRAY, borderWidth });
        break;
    }
  };
}
