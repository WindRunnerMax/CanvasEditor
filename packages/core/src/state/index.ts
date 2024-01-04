import type { Delta, Ops } from "sketching-delta";
import { DeltaSet, OP_TYPE } from "sketching-delta";
import { ROOT_DELTA } from "sketching-utils";

import type { Editor } from "../editor";
import { EntryDelta } from "../editor/delta/entry";
import { DEFAULT_DELTA_LIKE } from "../editor/utils/constant";
import { EDITOR_EVENT } from "../event/bus/action";
import { DeltaState } from "./node/state";
import type { EDITOR_STATE } from "./utils/constant";

export class EditorState {
  public readonly entry: DeltaState;
  private status: Map<string, boolean> = new Map();
  private deltas: Map<string, DeltaState> = new Map();

  constructor(private editor: Editor, private deltaSet: DeltaSet) {
    // Verify DeltaSet Rules
    const entryDelta = this.deltaSet.get(ROOT_DELTA);
    const entry = new EntryDelta(entryDelta?.toJSON() || DEFAULT_DELTA_LIKE);
    this.deltas.set(entry.id, new DeltaState(editor, entry));
    this.entry = this.getDeltaState(ROOT_DELTA);
    this.createDeltaStateTree();
  }

  private createDeltaStateTree() {
    // 初始化构建整个`Delta`状态树
    const dfs = (delta: Delta) => {
      const state = this.getDeltaState(delta.id);
      if (!state) return void 0;
      delta.children.forEach(id => {
        const child = this.deltaSet.get(id);
        if (!child) return void 0;
        // 按需创建`state`以及关联关系
        const childState = new DeltaState(this.editor, child);
        this.deltas.set(id, childState);
        state.addChild(childState);
        dfs(childState.delta);
      });
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

  public getDeltas() {
    return this.deltas;
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
        const state = new DeltaState(this.editor, delta);
        this.deltas.set(delta.id, state);
        target && target.insert(state);
        break;
      }
      case OP_TYPE.DELETE: {
        const { id } = op.payload;
        this.deltas.delete(id);
        const target = this.getDeltaState(id);
        target && target.remove();
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
      case OP_TYPE.RESIZE: {
        break;
      }
      case OP_TYPE.REVISE: {
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
