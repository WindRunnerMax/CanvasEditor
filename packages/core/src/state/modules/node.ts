import type { Delta } from "sketching-delta";

import { ElementNode } from "../../canvas/dom/element";
import type { Editor } from "../../editor";
import { Range } from "../../selection/modules/range";
import { NSBridge } from "./bridge";

export class DeltaState {
  public readonly id: string;
  public _parent: DeltaState | null;
  public readonly children: DeltaState[];
  constructor(private editor: Editor, private readonly delta: Delta) {
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

  public toRange() {
    return Range.from(this.delta);
  }

  public toDelta() {
    return this.delta;
  }

  public drawing(ctx: CanvasRenderingContext2D) {
    this.delta.drawing(ctx);
  }

  public insert(state: DeltaState) {
    const delta = state.delta;
    this.editor.deltaSet.add(delta);
    this.delta.insert(delta);
    state.setParent(this);
    this.children.push(state);
    const node = NSBridge.get(this);
    if (node) {
      const element = new ElementNode(delta.id, this.editor, state.toRange());
      node.append(element);
      NSBridge.set(state, element);
    }
    return this;
  }

  public remove() {
    this.editor.deltaSet.remove(this.delta);
    const parent = this.parent;
    if (!parent) return this;
    parent.delta.removeChild(this.delta);
    parent.children.splice(parent.children.indexOf(this), 1);
    const node = NSBridge.get(parent);
    if (node) {
      node.removeChild(NSBridge.get(this));
    }
    return this;
  }

  public move(x: number, y: number) {
    this.delta.move(x, y);
    const node = NSBridge.get(this);
    if (node) {
      node.setRange(Range.from(this.delta));
    }
    return this;
  }

  public resize(range: Range) {
    const { x, y, width, height } = range.rect();
    this.delta.setX(x);
    this.delta.setY(y);
    this.delta.setWidth(width);
    this.delta.setHeight(height);
    const node = NSBridge.get(this);
    if (node) {
      node.setRange(range);
    }
    return this;
  }
}
