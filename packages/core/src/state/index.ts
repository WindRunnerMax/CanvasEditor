import type { Delta, Ops } from "sketching-delta";
import { DeltaSet, OP_TYPE } from "sketching-delta";
import { ROOT_DELTA } from "sketching-utils";

import type { Editor } from "../editor";
import { EntryDelta } from "../editor/delta/entry";
import { DEFAULT_DELTA_LIKE } from "../editor/utils/constant";
import { EDITOR_EVENT } from "../event/bus/action";
import { DeltaState } from "./delta/state";
import type { EDITOR_STATE } from "./utils/constant";

export class EditorState {
  public readonly entry: DeltaState;
  private status: Map<string, boolean> = new Map();
  private deltas: Map<string, DeltaState> = new Map();

  constructor(private editor: Editor, private deltaSet: DeltaSet) {
    // Verify DeltaSet Rules
    if (!this.deltaSet.get(ROOT_DELTA)) {
      const entry = new EntryDelta(DEFAULT_DELTA_LIKE);
      this.deltas.set(entry.id, new DeltaState(editor, entry));
    }
    this.deltaSet.forEach((id, delta) => {
      this.deltas.set(id, new DeltaState(editor, delta));
    });
    this.entry = this.getDeltaState(ROOT_DELTA);
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

  public getDeltaState(deltaId: typeof ROOT_DELTA): DeltaState;
  public getDeltaState(deltaId: string): DeltaState | null;
  public getDeltaState(deltaId: string): DeltaState | null {
    return this.deltas.get(deltaId) || null;
  }

  public apply(op: Ops, options: { source?: string } = {}) {
    const { source = "user" } = options;
    const previous = new DeltaSet(this.deltaSet.getDeltas());
    const effect: string[] = [];

    switch (op.type) {
      case OP_TYPE.INSERT: {
        const { delta, id } = op.payload;
        const target = id ? this.getDeltaState(id) : this.entry;
        target && target.insert(delta);
        break;
      }
      case OP_TYPE.MOVE: {
        const { x, y } = op.payload;
        const select = this.editor.selection.getActiveDeltas();
        select.forEach(id => {
          const target = this.getDeltaState(id);
          target && target.move(x, y);
        });
        break;
      }
      default: {
        break;
      }
    }

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

    this.editor.canvas.graph.drawingAll();
  }
}
