import type { Delta } from "sketching-delta";

import type { Editor } from "../../editor";

export class DeltaState {
  public parent: DeltaState | null;
  public children: DeltaState[];
  constructor(private editor: Editor, public readonly delta: Delta) {
    this.parent = null;
    this.children = [];
  }

  public setParent(parent: DeltaState | null) {
    this.parent = parent;
  }

  public insert(delta: Delta) {
    this.editor.deltaSet.add(delta);
    this.delta.insert(delta);
    const state = new DeltaState(this.editor, delta);
    state.parent = this;
    this.children.push(state);
    return this;
  }

  public move(x: number, y: number) {
    this.delta.move(x, y);
    return this;
  }
}