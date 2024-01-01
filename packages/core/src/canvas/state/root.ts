import { throttle } from "sketching-utils";

import type { Editor } from "../../editor";
import { EDITOR_EVENT } from "../../event/bus/action";
import { Range } from "../../selection/range";
import type { DeltaState } from "../../state/node/state";
import { ElementNode } from "../dom/element";
import { MouseEvent } from "../dom/event";
import { Node } from "../dom/node";
import { ResizeNode } from "../dom/resize";
import { isPointInRange } from "../utils/is";
import { DELTA_TO_NODE, NODE_TO_DELTA, ROOT_TO_NODE } from "./map";
import { SelectNode } from "./select";

export class Root extends Node {
  public hover: ElementNode | ResizeNode | null;
  private select: SelectNode;
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
    const set = new WeakSet<DeltaState>();
    const queue: DeltaState[] = [];
    queue.push(this.editor.state.entry);
    DELTA_TO_NODE.set(this.editor.state.entry, this);
    NODE_TO_DELTA.set(this, this.editor.state.entry);
    const createElement = (state: DeltaState) => {
      const element = DELTA_TO_NODE.get(state);
      if (element) return element;
      return new ElementNode(state.id, this.editor, Range.from(state.delta));
    };
    while (queue.length) {
      const current = queue.shift();
      if (!current) break;
      if (set.has(current)) continue;
      const parent = createElement(current);
      DELTA_TO_NODE.set(current, parent);
      for (const state of current.children) {
        queue.push(state);
        const node = createElement(state);
        DELTA_TO_NODE.set(state, node);
        parent.append(node);
      }
    }
    this.append(this.select);
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
    const store = new WeakSet<Node>();
    const depthTraversal = (current: Node, depth: number) => {
      if (store.has(current)) return void 0;
      store.add(current);
      const eventFn = current[type];
      // 如果目标是节点本身 执行即可
      if (current === target) {
        eventFn && eventFn(event);
        return void 0;
      }
      // 捕获阶段执行的事件
      event.capture && eventFn && eventFn(event);
      for (const node of current.children) {
        if (node === target) {
          const eventFn = node[type];
          // 执行节点的事件
          eventFn && eventFn(event);
          break;
        }
        depthTraversal(node, depth + 1);
      }
      // 冒泡阶段执行的事件
      event.bubble && eventFn && eventFn(event);
    };
    depthTraversal(this, 0);
  }

  public getFlatNode = () => {
    const cache = ROOT_TO_NODE.get(this);
    if (cache) return cache;
    // 顺序很重要 层次遍历且后置先行
    const queue: Node[] = [];
    const result: Node[] = [];
    queue.push(this);
    while (queue.length) {
      const current = queue.shift();
      if (!current) break;
      result.unshift(current);
      for (const node of current.children) {
        queue.push(node);
      }
    }
    ROOT_TO_NODE.set(this, result);
    return result;
  };

  private onMouseDownController = (e: globalThis.MouseEvent) => {
    const flatNode = this.getFlatNode();
    let hit: Node | null = null;
    for (const node of flatNode) {
      if (isPointInRange(e.offsetX, e.offsetY, node.range)) {
        hit = node;
        break;
      }
    }
    hit && this.emit(hit, "onMouseDown", new MouseEvent(e));
  };

  private onMouseMoveController = throttle(
    (e: globalThis.MouseEvent) => {
      const flatNode = this.getFlatNode();
      let hit: ElementNode | ResizeNode | null = null;
      for (const node of flatNode) {
        const authorize = node instanceof ElementNode || node instanceof ResizeNode;
        if (authorize && isPointInRange(e.offsetX, e.offsetY, node.range)) {
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
    },
    30,
    { trailing: true }
  );

  private onMouseUpController = (e: globalThis.MouseEvent) => {
    const flatNode = this.getFlatNode();
    let hit: Node | null = null;
    for (const node of flatNode) {
      if (isPointInRange(e.offsetX, e.offsetY, node.range)) {
        hit = node;
        break;
      }
    }
    hit && this.emit(hit, "onMouseUp", new MouseEvent(e));
  };
}
