import type { Range } from "../../selection/range";

export class Node {
  private _range: Range;
  private _parent: Node | null;
  public readonly children: Node[];

  public onMouseDown?: (event: MouseEvent) => void;
  public onMouseUp?: (event: MouseEvent) => void;
  public onMouseMove?: (event: MouseEvent) => void;

  constructor(range: Range) {
    this._range = range;
    this._parent = null;
    this.children = [];
  }

  public get range() {
    return this._range;
  }

  public get parent() {
    return this._parent;
  }

  public setRange(range: Range) {
    this._range = range;
  }

  public setParent(parent: Node | null) {
    this._parent = parent;
  }

  public append<T extends Node>(node: T) {
    node.setParent(this);
    this.children.push(node);
  }

  public remove<T extends Node>(node: T) {
    const index = this.children.indexOf(node);
    index > -1 && this.children.splice(index, 1);
  }
}
