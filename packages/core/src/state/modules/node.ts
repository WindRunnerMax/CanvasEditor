import type { Delta, DeltaAttributes } from "sketching-delta";
import { isEmptyValue } from "sketching-utils";

import { ElementNode } from "../../canvas/dom/element";
import type { Editor } from "../../editor";
import { Range } from "../../selection/modules/range";
import { NSBridge } from "./bridge";

export class DeltaState {
  public readonly id: string;
  public readonly key: string;
  public _parent: DeltaState | null;
  public readonly children: DeltaState[];
  constructor(private editor: Editor, private readonly delta: Delta) {
    this.id = delta.id;
    this.key = delta.key;
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

  public getAttr(key: string): string | null {
    return this.delta.getAttr(key);
  }

  public getZ(): number {
    return this.delta.getZ();
  }

  public drawing(ctx: CanvasRenderingContext2D) {
    return this.delta.drawing(ctx);
  }

  public insert(state: DeltaState) {
    const delta = state.delta;
    this.editor.deltaSet.add(delta);
    this.delta.insert(delta);
    state.setParent(this);
    this.children.push(state);
    const node = NSBridge.get(this);
    if (node) {
      const element = new ElementNode(this.editor, state);
      node.append(element);
      NSBridge.set(state, element);
    } else {
      this.editor.logger.warning(`Node Not Found - ${this.delta.id}`);
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
    } else {
      this.editor.logger.warning(`Node Not Found - ${this.delta.id}`);
    }
    return this;
  }

  public move(x: number, y: number) {
    this.delta.move(x, y);
    const node = NSBridge.get(this);
    if (node) {
      node.setRange(Range.from(this.delta));
    } else {
      this.editor.logger.warning(`Node Not Found - ${this.delta.id}`);
    }
    return this;
  }

  public resize(range: Range) {
    const { x, y, width, height } = range.rect();
    this.delta.setRect(x, y, width, height);
    const node = NSBridge.get(this);
    if (node) {
      node.setRange(range);
    } else {
      this.editor.logger.warning(`Node Not Found - ${this.delta.id}`);
    }
    return this;
  }

  public revise(attrs: DeltaAttributes, z?: number) {
    for (const [key, value] of Object.entries(attrs)) {
      this.delta.setAttr(key, value);
    }
    const node = NSBridge.get(this);
    if (!node) {
      this.editor.logger.warning(`Node Not Found - ${this.delta.id}`);
      return void 0;
    }
    if (!isEmptyValue(z) && this.delta.getZ() !== z) {
      this.delta.setZ(z);
      node.setZ(z);
    }
  }
}
