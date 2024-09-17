import { ROOT_DELTA } from "sketching-utils";

import type { Editor } from "../editor";
import { EDITOR_EVENT } from "../event/bus/action";
import { EDITOR_STATE } from "../state/utils/constant";
import { Range } from "./modules/range";

export class Selection {
  /** 当前选区 Range */
  private current: Range | null;
  /** 选中的 Delta Id 组 */
  private active = new Set<string>();

  constructor(protected editor: Editor) {
    this.current = null;
  }

  public destroy() {
    // placeholder
  }

  public has(id: string) {
    return this.active.has(id);
  }

  public get() {
    return this.current;
  }

  public set(range: Range | null) {
    // 只读状态下无选区
    if (this.editor.state.get(EDITOR_STATE.READONLY)) return this;
    const previous = this.current;
    if (Range.isEqual(previous, range)) return this;
    this.current = range;
    this.editor.event.trigger(EDITOR_EVENT.SELECTION_CHANGE, {
      previous,
      current: range,
    });
    return this;
  }

  public getActiveDeltaIds() {
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

  /**
   * 清理选区内容
   * @returns
   */
  public clearActiveDeltas() {
    if (this.active.size === 0) {
      return void 0;
    }
    this.active.clear();
    this.set(null);
  }

  public selectAll() {
    const map = this.editor.state.getDeltasMap();
    const keys = Array.from(map.keys()).filter(key => key !== ROOT_DELTA);
    this.setActiveDelta(...keys);
  }

  /**
   * 组合当前选区节点的 Range
   * @returns
   */
  public compose() {
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
