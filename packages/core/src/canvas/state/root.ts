import { throttle } from "sketching-utils";

import type { Editor } from "../../editor";
import { EDITOR_EVENT } from "../../event/bus/action";
import { Point } from "../../selection/point";
import { Range } from "../../selection/range";
import type { DeltaState } from "../../state/node/state";
import { ElementNode } from "../dom/element";
import { MouseEvent } from "../dom/event";
import { Node } from "../dom/node";
import { ResizeNode } from "../dom/resize";
import { THE_CONFIG, THE_DELAY } from "../utils/constant";
import { DELTA_TO_NODE, NODE_TO_DELTA } from "./map";
import { SelectNode } from "./select";

export class Root extends Node {
  public hover: ElementNode | ResizeNode | null;
  public readonly select: SelectNode;
  constructor(private editor: Editor) {
    super(Range.from(0, 0));
    this.hover = null;
    this.editor.event.on(EDITOR_EVENT.MOUSE_DOWN, this.onMouseDownController);
    this.editor.event.on(EDITOR_EVENT.MOUSE_MOVE, this.onMouseMoveController);
    this.editor.event.on(EDITOR_EVENT.MOUSE_UP, this.onMouseUpController);
    this.select = new SelectNode(this.editor);
    this.createNodeStateTree();
  }

  destroy() {
    this.select.destroy();
    this.editor.event.off(EDITOR_EVENT.MOUSE_DOWN, this.onMouseDownController);
    this.editor.event.off(EDITOR_EVENT.MOUSE_MOVE, this.onMouseMoveController);
    this.editor.event.off(EDITOR_EVENT.MOUSE_UP, this.onMouseUpController);
  }

  private createNodeStateTree() {
    // 初始化构建整个`Node`状态树
    const queue: DeltaState[] = [];
    queue.push(this.editor.state.entry);
    DELTA_TO_NODE.set(this.editor.state.entry, this);
    const createElement = (state: DeltaState) => {
      const element = DELTA_TO_NODE.get(state);
      if (element) return element;
      return new ElementNode(state.id, this.editor, state.toRange());
    };
    while (queue.length) {
      const current = queue.shift();
      if (!current) break;
      const parent = createElement(current);
      DELTA_TO_NODE.set(current, parent);
      NODE_TO_DELTA.set(parent, current);
      for (const state of current.children) {
        queue.push(state);
        const node = createElement(state);
        DELTA_TO_NODE.set(state, node);
        NODE_TO_DELTA.set(node, state);
        parent.append(node);
      }
    }
    this.append(this.select);
  }

  public getFlatNode(): Node[] {
    return [...super.getFlatNode(), this];
  }

  protected onMouseDown = (e: MouseEvent) => {
    !e.shiftKey && this.editor.selection.clearActiveDeltas();
  };

  private emit(
    target: Node,
    // TODO: 抽象一下事件和类型对应关系
    type: "onMouseDown" | "onMouseUp" | "onMouseEnter" | "onMouseLeave",
    event: MouseEvent
  ) {
    const stack: Node[] = [];
    let node: Node | null = target.parent;
    while (node) {
      stack.push(node);
      node = node.parent;
    }
    // 捕获阶段执行的事件
    for (const node of stack.reverse()) {
      if (!event.capture) break;
      const eventFn = node[type];
      eventFn && eventFn(event);
    }
    // 节点本身 执行即可
    const eventFn = target[type];
    eventFn && eventFn(event);
    // 冒泡阶段执行的事件
    for (const node of stack) {
      if (!event.bubble) break;
      const eventFn = node[type];
      eventFn && eventFn(event);
    }
  }

  private onMouseDownController = (e: globalThis.MouseEvent) => {
    const flatNode = this.getFlatNode();
    let hit: Node | null = null;
    const point = Point.from(e);
    for (const node of flatNode) {
      if (node.range.include(point)) {
        hit = node;
        break;
      }
    }
    hit && this.emit(hit, "onMouseDown", new MouseEvent(e));
  };

  private onMouseMoveBridge = (e: globalThis.MouseEvent) => {
    const flatNode = this.getFlatNode();
    let hit: ElementNode | ResizeNode | null = null;
    const point = Point.from(e);
    for (const node of flatNode) {
      const authorize = node instanceof ElementNode || node instanceof ResizeNode;
      if (authorize && node.range.include(point)) {
        hit = node;
        break;
      }
    }
    // 如果命中节点且没有暂存的`hover`节点
    if (this.hover !== hit) {
      const prev = this.hover;
      this.hover = hit;
      prev && this.emit(prev, "onMouseLeave", new MouseEvent(e));
      hit && this.emit(hit, "onMouseEnter", new MouseEvent(e));
    }
  };
  private onMouseMoveController = throttle(this.onMouseMoveBridge, THE_DELAY, THE_CONFIG);

  private onMouseUpController = (e: globalThis.MouseEvent) => {
    const flatNode = this.getFlatNode();
    let hit: Node | null = null;
    const point = Point.from(e);
    for (const node of flatNode) {
      if (node.range.include(point)) {
        hit = node;
        break;
      }
    }
    hit && this.emit(hit, "onMouseUp", new MouseEvent(e));
  };
}
