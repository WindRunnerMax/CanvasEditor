import type { Range } from "../../selection/range";
import type { MouseEvent } from "./event";

export class Node {
  protected _z: number;
  private _range: Range;
  private _parent: Node | null;
  public readonly children: Node[];
  protected flatNodes: Node[] | null;

  // 尽可能简单地实现事件流
  // 直接通过`bubble`来决定捕获/冒泡
  protected onMouseDown?: (event: MouseEvent) => void;
  protected onMouseUp?: (event: MouseEvent) => void;
  protected onMouseEnter?: (event: MouseEvent) => void;
  protected onMouseLeave?: (event: MouseEvent) => void;

  // `Canvas`绘制节点
  public drawingMask?: (ctx: CanvasRenderingContext2D) => void;

  constructor(range: Range) {
    this._z = 0;
    this.children = [];
    this._range = range;
    this._parent = null;
    this.flatNodes = null;
  }

  // ====== Parent ======
  public get parent() {
    return this._parent;
  }

  public setParent(parent: Node | null) {
    this._parent = parent;
  }

  // ====== Range ======
  public get range() {
    return this._range;
  }

  public setRange(range: Range) {
    this._range = range;
  }

  // ====== Z-Index ======
  public get z() {
    return this._z;
  }

  public setZIndex(z: number) {
    if (this.z !== z) {
      const parent = this._parent;
      if (parent) {
        // 先移除后添加保证顺序
        parent.removeChild(this);
        parent.append(this);
      }
      this._z = z;
    }
  }

  // ====== DOM OP ======
  public append<T extends Node>(node: T) {
    // 类似希尔排序 保证`children`有序
    // 如果使用`sort`也可以 `ES`规范添加了`sort`作为稳定排序
    const index = this.children.findIndex(item => item.z > node.z);
    if (index > -1) {
      this.children.splice(index, 0, node);
    } else {
      this.children.push(node);
    }
    node.setParent(this);
    this.clearFlatNodeOnLink();
  }

  public removeChild<T extends Node>(node: T) {
    const index = this.children.indexOf(node);
    if (index > -1) {
      this.children.splice(index, 1);
    }
    this.clearFlatNodeOnLink();
  }

  public remove() {
    const parent = this._parent;
    if (parent) {
      const index = parent.children.indexOf(this);
      if (index > -1) {
        this.children.splice(index, 1);
      }
      this.clearFlatNodeOnLink();
    }
  }

  // ====== Flat Node ======
  public getFlatNode() {
    if (this.flatNodes) return this.flatNodes;
    // 右子树优先后序遍历
    const nodes: Node[] = [];
    const reverse = this.children.reverse();
    reverse.forEach(node => {
      nodes.push(...node.getFlatNode());
      nodes.push(node);
    });
    this.flatNodes = nodes;
    return nodes;
  }

  public clearFlatNode() {
    this.flatNodes = null;
  }

  public clearFlatNodeOnLink() {
    this.clearFlatNode();
    let node: Node | null = this.parent;
    while (node) {
      node.clearFlatNode();
      node = node.parent;
    }
  }
}
