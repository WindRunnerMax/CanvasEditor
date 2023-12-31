import { isInsideDelta } from "../canvas/utils/is";
import type { Editor } from "../editor";
import { EDITOR_EVENT } from "../event/bus/action";
import { Range } from "./range";

export class Selection {
  private current: Range | null;
  private active = new Set<string>();

  constructor(protected editor: Editor) {
    this.current = null;
    this.editor.event.on(EDITOR_EVENT.MOUSE_DOWN, this.onMouseDown, 0);
  }

  public destroy() {
    this.editor.event.off(EDITOR_EVENT.MOUSE_DOWN, this.onMouseDown);
  }

  // ====== Mouse Event ======
  private onMouseDown = (e: MouseEvent) => {
    const delta = isInsideDelta(this.editor, e.offsetX, e.offsetY);
    // Process selection group
    if (delta) {
      e.shiftKey ? this.addActiveDelta(delta.id) : this.setActiveDelta(delta.id);
    } else {
      !e.shiftKey && this.clearActiveDeltas();
    }
    this.composeRange();
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
