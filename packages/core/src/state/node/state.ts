import type { Delta } from "sketching-delta";

import { DELTA_TO_NODE } from "../../canvas/state/map";
import type { Editor } from "../../editor";
import { Range } from "../../selection/range";

export class DeltaState {
  public readonly id: string;
  public _parent: DeltaState | null;
  public readonly children: DeltaState[];
  constructor(private editor: Editor, public readonly delta: Delta) {
    this.id = delta.id;
    this._parent = null;
    this.children = [];
  }

  public get parent() {
    return this._parent;
  }

  public setParent(parent: DeltaState | null) {
    this._parent = parent;
  }

  public addChild(child: DeltaState) {
    child.setParent(this);
    this.children.push(child);
  }

  public insert(state: DeltaState) {
    const delta = state.delta;
    this.editor.deltaSet.add(delta);
    this.delta.insert(delta);
    state.setParent(this);
    this.children.push(state);
    return this;
  }

  public remove() {
    this.editor.deltaSet.remove(this.delta);
    const parent = this.parent;
    if (!parent) return this;
    parent.delta.removeChild(this.delta);
    parent.children.splice(parent.children.indexOf(this), 1);
    return this;
  }

  public move(x: number, y: number) {
    this.delta.move(x, y);
    const node = DELTA_TO_NODE.get(this);
    if (node) {
      node.setRange(Range.from(this.delta));
    }
    return this;
  }
}
