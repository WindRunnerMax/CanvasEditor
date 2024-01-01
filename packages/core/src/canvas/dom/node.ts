import type { Range } from "../../selection/range";
import { ROOT_TO_NODE } from "../state/map";
import type { MouseEvent } from "./event";

export class Node {
  private _range: Range;
  private root: Node | null;
  private _parent: Node | null;
  public readonly children: Node[];

  public onMouseDown?: (event: MouseEvent) => void;
  public onMouseUp?: (event: MouseEvent) => void;
  public onMouseEnter?: (event: MouseEvent) => void;
  public onMouseLeave?: (event: MouseEvent) => void;

  constructor(range: Range) {
    this.root = null;
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
    const root = this.findRootNode();
    ROOT_TO_NODE.delete(root);
    node.setParent(this);
    this.children.push(node);
  }

  public remove<T extends Node>(node: T) {
    const index = this.children.indexOf(node);
    if (index > -1) {
      const root = this.findRootNode();
      ROOT_TO_NODE.delete(root);
      this.children.splice(index, 1);
    }
  }

  private findRootNode = (): Node => {
    if (this.root) return this.root;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let current: Node = this;
    while (current.parent) {
      current = current.parent;
    }
    this.root = current;
    return current;
  };
}
