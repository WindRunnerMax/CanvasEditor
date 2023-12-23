import type { Delta } from "sketching-delta";

import type { Editor } from "../editor";

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
}
