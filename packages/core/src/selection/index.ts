import { throttle } from "sketching-utils";

import type { Editor } from "../editor";
import { EDITOR_EVENT } from "../event/bus/action";
import { EDITOR_STATE } from "../state/utils/constant";
import { isInsideDelta } from "./utils/is";
import type { Range } from "./utils/types";

export class Selection {
  private hover: string;
  private current: Range | null;
  private active = new Set<string>();

  constructor(private editor: Editor) {
    this.hover = "";
    this.current = null;
    this.editor.event.on(EDITOR_EVENT.MOUSE_DOWN, this.onMouseDown);
    this.editor.event.on(EDITOR_EVENT.MOUSE_MOVE, this.onMouseMove);
  }

  public destroy() {
    this.editor.event.off(EDITOR_EVENT.MOUSE_DOWN, this.onMouseDown);
    this.editor.event.off(EDITOR_EVENT.MOUSE_MOVE, this.onMouseMove);
  }

  private composeRange() {
    // Multiple to be combined
    const active = this.active;
    if (active.size === 0) {
      this.current = null;
      return void 0;
    }
    const current: Range = { startX: Infinity, startY: Infinity, endX: -Infinity, endY: -Infinity };
    active.forEach(key => {
      const delta = this.editor.deltaSet.get(key);
      if (!delta) return void 0;
      const { x, y, width, height } = delta.getRect();
      current.startX = Math.min(current.startX, x);
      current.startY = Math.min(current.startY, y);
      current.endX = Math.max(current.endX, x + width);
      current.endY = Math.max(current.endY, y + height);
    });
    this.current = current;
  }

  private onMouseDown = (e: MouseEvent) => {
    this.hover = "";
    const delta = isInsideDelta(this.editor, e.offsetX, e.offsetY);
    if (delta && delta.id) {
      e.shiftKey ? this.addActiveDelta(delta.id) : this.setActiveDelta(delta.id);
    } else {
      !e.shiftKey && this.clearActiveDeltas();
    }
    this.composeRange();
    this.editor.canvas.mask.drawingState();
  };

  private onMouseMove = throttle(
    (e: MouseEvent) => {
      if (this.editor.state.get(EDITOR_STATE.MOUSE_DOWN)) return void 0;
      const delta = isInsideDelta(this.editor, e.offsetX, e.offsetY);
      delta && delta.id ? (this.hover = delta.id) : (this.hover = "");
      this.editor.canvas.mask.drawingState();
    },
    60,
    { trailing: true }
  );

  public get() {
    return this.current;
  }

  public getHoverDelta() {
    return this.hover;
  }

  public getActiveDeltas() {
    return this.active;
  }
  public addActiveDelta(deltaId: string) {
    this.active.add(deltaId);
  }
  public setActiveDelta(deltaId: string) {
    this.clearActiveDeltas();
    this.addActiveDelta(deltaId);
  }
  public removeActiveDelta(deltaId: string) {
    this.active.delete(deltaId);
  }
  public clearActiveDeltas() {
    this.active.clear();
  }
}
