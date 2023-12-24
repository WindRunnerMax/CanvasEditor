import { Op, OpType } from "sketching-delta";
import { isEmptyValue, throttle } from "sketching-utils";

import type { Editor } from "../editor";
import { EDITOR_EVENT } from "../event/bus/action";
import { EDITOR_STATE } from "../state/utils/constant";
import { Point } from "./modules/point";
import { Range } from "./modules/range";
import { SelectionStore } from "./modules/state";
import { SELECT_BIAS, SELECTION_OP, SELECTION_STATE } from "./utils/constant";
import { setCursorState } from "./utils/cursor";
import { isInsideDelta } from "./utils/is";

export class Selection extends SelectionStore {
  private current: Range | null;
  private active = new Set<string>();

  constructor(protected editor: Editor) {
    super(editor);
    this.current = null;
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
    this.setState(SELECTION_STATE.LANDING_POINT, new Point(e.offsetX, e.offsetY));
    const delta = isInsideDelta(this.editor, e.offsetX, e.offsetY);
    // Process selection group
    if (delta) {
      e.shiftKey ? this.addActiveDelta(delta.id) : this.setActiveDelta(delta.id);
    } else {
      !e.shiftKey && this.clearActiveDeltas();
    }
    this.composeRange();
  };

  private onMouseMove = throttle(
    (e: MouseEvent) => {
      const { offsetX, offsetY } = e;
      const point = this.getState(SELECTION_STATE.LANDING_POINT);
      const opType = this.getState(SELECTION_STATE.OP);
      if (!this.editor.state.get(EDITOR_STATE.MOUSE_DOWN)) {
        // Pure hover state
        const delta = isInsideDelta(this.editor, e.offsetX, e.offsetY);
        if (delta) {
          this.setState(SELECTION_STATE.HOVER, delta.id);
        } else {
          this.setState(SELECTION_STATE.HOVER, null);
        }
        const state = setCursorState(this.editor, e);
        this.setState(SELECTION_STATE.RESIZE, state);
        !isEmptyValue(state) && this.setState(SELECTION_STATE.OP, SELECTION_OP.RESIZE);
      } else if (opType === SELECTION_OP.TRANSLATE && point && this.current) {
        const { startX, startY, endX, endY } = this.current.flat();
        this.setState(
          SELECTION_STATE.OP_RECT,
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
          if (this.get()) {
            this.setState(SELECTION_STATE.OP, SELECTION_OP.TRANSLATE);
          } else {
            this.setState(SELECTION_STATE.OP, SELECTION_OP.FRAME_SELECT);
          }
        }
      }
    },
    30,
    { trailing: true }
  );

  private onMouseUp = (e: MouseEvent) => {
    const rect = this.getState(SELECTION_STATE.OP_RECT);
    if (rect && this.current) {
      const { startX, startY } = this.current.flat();
      this.editor.state.apply(
        new Op(OpType.MOVE, {
          x: rect.start.x - startX,
          y: rect.start.y - startY,
        })
      );
      this.set(rect);
    }
    this.setState(SELECTION_STATE.LANDING_POINT, null);
    this.setState(SELECTION_STATE.OP_RECT, null);
    this.setState(SELECTION_STATE.OP, null);
    setCursorState(this.editor, e);
  };

  // ====== Selection ======
  public get() {
    return this.current;
  }

  public set(range: Range | null) {
    const previous = this.current;
    if (Range.isEqual(previous, range)) return this;
    this.current = range;
    this.editor.event.trigger(EDITOR_EVENT.SELECTION_CHANGE, {
      previous,
      current: range,
    });
    return this;
  }

  // ====== Active ======
  public getActiveDeltas() {
    return this.active;
  }

  public addActiveDelta(deltaId: string) {
    this.active.add(deltaId);
  }

  public removeActiveDelta(deltaId: string) {
    this.active.delete(deltaId);
  }

  public setActiveDelta(deltaId: string) {
    this.clearActiveDeltas();
    this.addActiveDelta(deltaId);
  }

  public clearActiveDeltas() {
    this.active.clear();
  }

  // ====== Range ======
  private composeRange() {
    // Multiple to be combined
    const active = this.active;
    if (active.size === 0) {
      this.set(null);
      return void 0;
    }
    const current = { startX: Infinity, startY: Infinity, endX: -Infinity, endY: -Infinity };
    active.forEach(key => {
      const delta = this.editor.deltaSet.get(key);
      if (!delta) return void 0;
      const { x, y, width, height } = delta.getRect();
      current.startX = Math.min(current.startX, x);
      current.startY = Math.min(current.startY, y);
      current.endX = Math.max(current.endX, x + width);
      current.endY = Math.max(current.endY, y + height);
    });
    this.set(new Range(current));
  }
}
