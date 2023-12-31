import type { Delta } from "sketching-delta";

import type { Editor } from "../../editor";

export class DeltaState {
  public _parent: DeltaState | null;
  public readonly children: DeltaState[];
  constructor(private editor: Editor, public readonly delta: Delta) {
    this._parent = null;
    this.children = [];
  }

  public get parent() {
    return this._parent;
  }

  public setParent(parent: DeltaState | null) {
    this._parent = parent;
  }

  public insert(delta: Delta) {
    this.editor.deltaSet.add(delta);
    this.delta.insert(delta);
    const state = new DeltaState(this.editor, delta);
    state.setParent(this);
    this.children.push(state);
    return this;
  }

  public move(x: number, y: number) {
    this.delta.move(x, y);
    return this;
  }
}
