import type { Range } from "../../selection/range";
import { ROOT_TO_NODE } from "../state/map";
import type { MouseEvent } from "./event";

export class Node {
  private _range: Range;
  private root: Node | null;
  private _parent: Node | null;
  public readonly children: Node[];

  // 尽可能简单地实现事件流
  // 直接通过`bubble`来决定捕获/冒泡
  protected onMouseDown?: (event: MouseEvent) => void;
  protected onMouseUp?: (event: MouseEvent) => void;
  protected onMouseEnter?: (event: MouseEvent) => void;
  protected onMouseLeave?: (event: MouseEvent) => void;

  // `Canvas`绘制节点
  public drawingMask?: (ctx: CanvasRenderingContext2D) => void;

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
