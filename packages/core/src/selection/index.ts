import type { Editor } from "../editor";
import { EDITOR_EVENT } from "../event/bus/action";
import { Range } from "./range";

export class Selection {
  private current: Range | null;
  private active = new Set<string>();

  constructor(protected editor: Editor) {
    this.current = null;
  }

  public destroy() {
    // Placeholder
  }

  // ====== Selection ======
  public has(id: string) {
    return this.active.has(id);
  }

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
    if (this.active.has(deltaId)) return void 0;
    this.active.add(deltaId);
    this.compose();
  }

  public removeActiveDelta(deltaId: string) {
    if (!this.active.has(deltaId)) return void 0;
    this.active.delete(deltaId);
    this.compose();
  }

  public setActiveDelta(deltaId: string) {
    if (this.active.size === 1 && this.active.has(deltaId)) return void 0;
    this.active.clear();
    this.addActiveDelta(deltaId);
    this.compose();
  }

  public clearActiveDeltas() {
    if (this.active.size === 0) return void 0;
    this.active.clear();
    this.set(null);
  }

  // ====== Range ======
  public compose() {
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
