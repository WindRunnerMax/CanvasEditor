import type { Editor } from "../editor";
import { EDITOR_EVENT } from "../event/bus/action";
import { Range } from "./modules/range";

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
  public getActiveDeltaId() {
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

  public setActiveDelta(...deltaIds: string[]) {
    this.active.clear();
    deltaIds.forEach(id => this.active.add(id));
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
    let range: Range | null = null;
    active.forEach(key => {
      const delta = this.editor.deltaSet.get(key);
      if (!delta) return void 0;
      const deltaRange = Range.from(delta);
      range = range ? range.compose(deltaRange) : deltaRange;
    });
    this.set(range);
  }
}
