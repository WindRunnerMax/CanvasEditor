import { Op, OpType } from "sketching-delta";
import { isEmptyValue, throttle } from "sketching-utils";

import type { Editor } from "../../editor";
import { EDITOR_EVENT } from "../../event/bus/action";
import type { SelectionStateEvent } from "../../event/bus/types";
import { Point } from "../../selection/modules/point";
import { Range } from "../../selection/modules/range";
import { EDITOR_STATE } from "../../state/utils/constant";
import type { SelectionState } from "../utils/constant";
import { CANVAS_OP, CANVAS_STATE, SELECT_BIAS } from "../utils/constant";
import { setCursorState } from "../utils/cursor";
import { isInsideDelta } from "../utils/is";
export class CanvasStateStore {
  private state: SelectionState;
  constructor(protected editor: Editor) {
    this.state = {};
    this.editor.event.on(EDITOR_EVENT.MOUSE_DOWN, this.onMouseDown);
    this.editor.event.on(EDITOR_EVENT.MOUSE_MOVE, this.onMouseMove);
    this.editor.event.on(EDITOR_EVENT.MOUSE_UP, this.onMouseUp);
  }

  public destroy() {
    this.editor.event.off(EDITOR_EVENT.MOUSE_DOWN, this.onMouseDown);
    this.editor.event.off(EDITOR_EVENT.MOUSE_MOVE, this.onMouseMove);
    this.editor.event.off(EDITOR_EVENT.MOUSE_UP, this.onMouseUp);
  }

  // ====== Mouse Event ======
  // TODO: 需要重构事件的状态管理 拆分结构 太乱了
  private onMouseDown = (e: MouseEvent) => {
    this.editor.canvas.setState(CANVAS_STATE.LANDING_POINT, new Point(e.offsetX, e.offsetY));
  };

  private onMouseMove = throttle(
    (e: MouseEvent) => {
      const { offsetX, offsetY } = e;
      const selection = this.editor.selection.get();
      const point = this.editor.canvas.getState(CANVAS_STATE.LANDING_POINT);
      const opType = this.editor.canvas.getState(CANVAS_STATE.OP);
      if (!this.editor.state.get(EDITOR_STATE.MOUSE_DOWN)) {
        // Pure hover state
        const delta = isInsideDelta(this.editor, e.offsetX, e.offsetY);
        if (delta) {
          this.editor.canvas.setState(CANVAS_STATE.HOVER, delta.id);
        } else {
          this.editor.canvas.setState(CANVAS_STATE.HOVER, null);
        }
        const state = setCursorState(this.editor, e);
        this.editor.canvas.setState(CANVAS_STATE.RESIZE, state);
        !isEmptyValue(state) && this.editor.canvas.setState(CANVAS_STATE.OP, CANVAS_OP.RESIZE);
      } else if (opType === CANVAS_OP.TRANSLATE && point && selection) {
        const { startX, startY, endX, endY } = selection.flat();
        this.editor.canvas.setState(
          CANVAS_STATE.OP_RECT,
          new Range({
            startX: startX + offsetX - point.x,
            startY: startY + offsetY - point.y,
            endX: endX + offsetX - point.x,
            endY: endY + offsetY - point.y,
          })
        );
      } else if (point) {
        const { x, y } = point;
        if (Math.abs(e.offsetX - x) > SELECT_BIAS || Math.abs(e.offsetY - y) > SELECT_BIAS) {
          if (selection) {
            this.editor.canvas.setState(CANVAS_STATE.OP, CANVAS_OP.TRANSLATE);
          } else {
            this.editor.canvas.setState(CANVAS_STATE.OP, CANVAS_OP.FRAME_SELECT);
          }
        }
      }
    },
    30,
    { trailing: true }
  );

  private onMouseUp = (e: MouseEvent) => {
    const rect = this.editor.canvas.getState(CANVAS_STATE.OP_RECT);
    const selection = this.editor.selection.get();
    if (rect && selection) {
      const { startX, startY } = selection.flat();
      this.editor.state.apply(
        new Op(OpType.MOVE, {
          x: rect.start.x - startX,
          y: rect.start.y - startY,
        })
      );
      this.editor.selection.set(rect);
    }
    this.editor.canvas.setState(CANVAS_STATE.LANDING_POINT, null);
    this.editor.canvas.setState(CANVAS_STATE.OP_RECT, null);
    this.editor.canvas.setState(CANVAS_STATE.OP, null);
    setCursorState(this.editor, e);
  };

  // ====== State ======
  public setState<T extends CANVAS_STATE>(key: T, value: SelectionState[T]) {
    this.state[key] = value;
    const action: SelectionStateEvent = { type: key as number, payload: value };
    this.editor.event.trigger(EDITOR_EVENT.CANVAS_STATE, action);
    return this;
  }

  public getState<T extends CANVAS_STATE>(key: T): SelectionState[T] {
    return this.state[key];
  }

  public resetState() {
    this.state = {};
    return this;
  }
}
