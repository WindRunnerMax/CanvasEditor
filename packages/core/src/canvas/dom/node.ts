import type { Empty } from "sketching-utils";

import type { Range } from "../../selection/modules/range";
import type { MouseEvent } from "../event/mouse";

export class Node {
  /** 节点 Range */
  private _range: Range;
  /** 父节点引用 */
  private _parent: Node | null;
  /** 层级 */
  protected _z: number;
  /** 忽略事件触发 */
  protected _ignoreEvent: boolean;
  /** 当前树结构的所有子节点 */
  protected flatNodes: Node[] | null;
  /** 当前节点的直属子节点 */
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
    this._z = 0;
    this.children = [];
    this._range = range;
    this._parent = null;
    this.flatNodes = null;
    this._ignoreEvent = false;
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

  public setZ(z: number) {
    if (this.z !== z) {
      this._z = z;
      const parent = this._parent;
      if (parent) {
        // 先移除后添加保证顺序
        parent.removeChild(this);
        parent.append(this);
      }
    }
  }

  // ====== Event ======
  public get ignoreEvent() {
    return this._ignoreEvent;
  }

  public setIgnoreEvent(ignoreEvent: boolean) {
    this._ignoreEvent = ignoreEvent;
  }

  // ====== DOM OP ======
  public append<T extends Node>(node: T | Empty) {
    if (!node) return void 0;
    // 类似希尔排序 保证`children`有序 `zIndex`升序
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

  public removeChild<T extends Node>(node: T | Empty) {
    if (!node) return void 0;
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

  public clearNodes() {
    this.children.length = 0;
    this.clearFlatNodeOnLink();
  }

  /**
   * 获取当前节点树的所有子节点
   * @returns
   */
  public getFlatNode() {
    if (this.flatNodes) {
      return this.flatNodes;
    }
    // 右子树优先后序遍历 保证事件调用的顺序
    const nodes: Node[] = [];
    const reverse = [...this.children].reverse();
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
