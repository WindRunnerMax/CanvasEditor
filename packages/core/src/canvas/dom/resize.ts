import { Op, OP_TYPE } from "sketching-delta";
import { throttle } from "sketching-utils";
import { WHITE } from "sketching-utils";

import { GRAY_5 } from "../../../../utils/src/palette";
import type { Editor } from "../../editor";
import { EDITOR_EVENT } from "../../event/bus/action";
import { Point } from "../../selection/modules/point";
import { Range } from "../../selection/modules/range";
import { EDITOR_STATE } from "../../state/utils/constant";
import type { MouseEvent } from "../event/mouse";
import type { ResizeType } from "../types/dom";
import { noZero } from "../utils/cipher";
import {
  FINE_TUNE,
  MAX_Z_INDEX,
  RESIZE_LEN,
  RESIZE_OFS,
  RESIZE_TYPE,
  SELECT_BIAS,
  THE_CONFIG,
} from "../utils/constant";
import { Shape } from "../utils/shape";
import { Node } from "./node";

export class ResizeNode extends Node {
  private type: ResizeType;
  private isResizing: boolean;
  private latest: Range | null;
  private landing: Point | null;
  private landingRange: Range | null;

  constructor(private editor: Editor, type: ResizeType, parent: Node) {
    super(Range.reset());
    this.type = type;
    this.latest = null;
    this.landing = null;
    this.setParent(parent);
    this.isResizing = false;
    this.landingRange = null;
    this._z = MAX_Z_INDEX - 1;
  }

  public setRange = (range: Range) => {
    const { startX, startY, endX, endY } = range.flatten();
    if (this.editor.canvas.isOutside(range)) {
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
        target = Range.from(
          x - offset - FINE_TUNE,
          y - RESIZE_OFS,
          x + offset - FINE_TUNE,
          y + RESIZE_OFS
        );
        break;
      }
      case RESIZE_TYPE.R: {
        const range = Range.from(endX, startY, endX, endY);
        const { x, y } = range.center();
        const offset = RESIZE_OFS / 2;
        target = Range.from(
          x - offset + FINE_TUNE,
          y - RESIZE_OFS,
          x + offset + FINE_TUNE,
          y + RESIZE_OFS
        );
        break;
      }
      case RESIZE_TYPE.T: {
        const range = Range.from(startX, startY, endX, startY);
        const { x, y } = range.center();
        const offset = RESIZE_OFS / 2;
        target = Range.from(
          x - RESIZE_OFS,
          y - offset - FINE_TUNE,
          x + RESIZE_OFS,
          y + offset - FINE_TUNE
        );
        break;
      }
      case RESIZE_TYPE.B: {
        const range = Range.from(startX, endY, endX, endY);
        const { x, y } = range.center();
        const offset = RESIZE_OFS / 2;
        target = Range.from(
          x - RESIZE_OFS,
          y - offset + FINE_TUNE,
          x + RESIZE_OFS,
          y + offset + FINE_TUNE
        );
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

  private bindOpEvents = () => {
    this.editor.event.on(EDITOR_EVENT.MOUSE_UP_GLOBAL, this.onMouseUpController);
    this.editor.event.on(EDITOR_EVENT.MOUSE_MOVE_GLOBAL, this.onMouseMoveController);
  };

  private unbindOpEvents = () => {
    this.editor.event.off(EDITOR_EVENT.MOUSE_UP_GLOBAL, this.onMouseUpController);
    this.editor.event.off(EDITOR_EVENT.MOUSE_MOVE_GLOBAL, this.onMouseMoveController);
  };

  protected onMouseDown = (e: MouseEvent) => {
    this.unbindOpEvents();
    const selection = this.editor.selection.get();
    if (!selection || !this.parent) {
      return void 0;
    }
    this.landingRange = selection;
    this.landing = Point.from(e.clientX, e.clientY);
    this.bindOpEvents();
  };

  private onMouseMoveBasic = (e: globalThis.MouseEvent) => {
    const selection = this.editor.selection.get();
    if (!this.landing || !selection || !this.landingRange || !this.parent) return void 0;
    const point = Point.from(e.clientX, e.clientY);
    const { x, y } = this.landing.diff(point);
    if (!this.isResizing && (Math.abs(x) > SELECT_BIAS || Math.abs(y) > SELECT_BIAS)) {
      // 拖拽阈值
      this.isResizing = true;
    }
    if (this.isResizing && selection) {
      let formattedX = x;
      let formattedY = y;
      const { width, height } = this.landingRange.rect();
      const ratio = width / noZero(height);
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
    }
  };
  private onMouseMoveController = throttle(this.onMouseMoveBasic, ...THE_CONFIG);

  private onMouseUpController = (e: globalThis.MouseEvent) => {
    this.unbindOpEvents();
    if (this.isResizing && this.latest && this.parent && this.landingRange) {
      const point = Point.from(e, this.editor);
      const latest = this.latest;
      this.editor.canvas.mask.setCursorState(null);
      // 根据点位调整`Resize`节点位置
      this.parent.children.forEach(node => {
        node.setRange(latest);
        node instanceof ResizeNode && node.setCursorState(point);
      });
      // 需要根据新旧选区调整包含的每个图形的大小和位置
      const nodes = this.editor.selection.getActiveDeltaIds();
      const { width: oldWidth, height: oldHeight, x: oldX, y: oldY } = this.landingRange.rect();
      const { width: newWidth, height: newHeight, x: newX, y: newY } = this.latest.rect();
      const ratioX = newWidth / noZero(oldWidth);
      const ratioY = newHeight / noZero(oldHeight);
      nodes.forEach(id => {
        const state = this.editor.state.getDeltaState(id);
        if (!state) return void 0;
        const { x: nodeX, y: nodeY, width: nodeWidth, height: nodeHeight } = state.toRange().rect();
        const x = newX + (nodeX - oldX) * ratioX;
        const y = newY + (nodeY - oldY) * ratioY;
        const width = nodeWidth * ratioX;
        const height = nodeHeight * ratioY;
        this.editor.state.apply(
          Op.from(OP_TYPE.RESIZE, { id, x, y, width: noZero(width), height: noZero(height) })
        );
      });
    }
    this.latest = null;
    this.landing = null;
    this.isResizing = false;
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
        Shape.arc(ctx, { x, y, borderColor: GRAY_5, fillColor, radius, borderWidth });
        break;
      case RESIZE_TYPE.B:
      case RESIZE_TYPE.R:
      case RESIZE_TYPE.T:
      case RESIZE_TYPE.L:
        Shape.rect(ctx, { ...range.rect(), fillColor, borderColor: GRAY_5, borderWidth });
        break;
    }
  };
}
