import type { Delta, Op } from "sketching-delta";
import { DeltaSet } from "sketching-delta";
import { ROOT_ZONE } from "sketching-utils";

import type { Editor } from "../editor";
import { DEFAULT_DELTA_LIKE } from "../editor/constant";
import { EntryDelta } from "../editor/entry";
import { EDITOR_EVENT } from "../event/bus/action";
import type { EDITOR_STATE } from "./constant";
import { DeltaState } from "./delta-state";

export class EditorState {
  private active = ROOT_ZONE;
  public readonly entry: DeltaState;
  private status: Map<string, boolean>;
  private deltas: Map<string, DeltaState>;

  constructor(private editor: Editor, private deltaSet: DeltaSet) {
    this.status = new Map();
    this.deltas = new Map();
    // Verify DeltaSet Rules
    if (!this.deltaSet.get(ROOT_ZONE)) {
      const entry = new EntryDelta(DEFAULT_DELTA_LIKE);
      this.deltas.set(entry.id, new DeltaState(editor, entry));
    }
    this.deltaSet.forEach((id, delta) => {
      this.deltas.set(id, new DeltaState(editor, delta));
    });
    this.entry = this.getDeltaState(ROOT_ZONE);
    this.createTreeState();
  }

  private createTreeState() {
    const set = new WeakSet<Delta>();
    const dfs = (current: Delta) => {
      if (set.has(current)) return void 0;
      const state = this.getDeltaState(current.id);
      if (!state) return void 0;
      state.children = current.children
        .map(id => {
          const childState = this.getDeltaState(id);
          childState && childState.setParent(state);
          childState && dfs(childState.delta);
          return childState;
        })
        .filter(Boolean) as DeltaState[];
    };
    dfs(this.entry.delta);
  }

  public get(key: keyof typeof EDITOR_STATE) {
    return this.status.get(key);
  }

  public set(key: keyof typeof EDITOR_STATE, value: boolean) {
    this.status.set(key, value);
    return this;
  }

  public getDeltaState(deltaId: typeof ROOT_ZONE): DeltaState;
  public getDeltaState(deltaId: string): DeltaState | null;
  public getDeltaState(deltaId: string): DeltaState | null {
    return this.deltas.get(deltaId) || null;
  }

  public getActiveZone() {
    return this.active;
  }

  // TODO: 根据`focus`的节点查找对应的`deltaId`
  public setActiveZone(deltaId: string) {
    this.active = deltaId;
  }

  public apply(op: Op, options: { source?: string } = {}) {
    const { source = "user" } = options;
    const previous = new DeltaSet(this.deltaSet.getDeltas());
    const effect: string[] = [];

    Promise.resolve().then(() => {
      this.editor.event.trigger(EDITOR_EVENT.CONTENT_CHANGE, {
        previous,
        current: this.deltaSet,
        source,
        // TODO: 合并`Op`
        changes: op,
        effect,
      });
    });
  }
}
