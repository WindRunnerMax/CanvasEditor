import { throttle } from "sketching-utils";

import type { Editor } from "../../editor";
import { EDITOR_EVENT } from "../../event/bus/action";
import { Point } from "../../selection/modules/point";
import { Range } from "../../selection/modules/range";
import { NSBridge } from "../../state/modules/bridge";
import type { DeltaState } from "../../state/modules/node";
import { ElementNode } from "../dom/element";
import { FrameNode } from "../dom/frame";
import { Node } from "../dom/node";
import { ResizeNode } from "../dom/resize";
import { SelectNode } from "../dom/select";
import { MouseEvent } from "../event/mouse";
import type { NodeEvent } from "../event/types";
import { NODE_EVENT } from "../event/types";
import type { Canvas } from "../index";
import { THE_CONFIG, THE_DELAY } from "../utils/constant";

export class Root extends Node {
  public hover: ElementNode | ResizeNode | null;
  public readonly frame: FrameNode;
  public readonly select: SelectNode;

  constructor(private editor: Editor, private engine: Canvas) {
    super(Range.from(0, 0));
    this.hover = null;
    this.editor.event.on(EDITOR_EVENT.MOUSE_DOWN, this.onMouseDownController);
    this.editor.event.on(EDITOR_EVENT.MOUSE_MOVE, this.onMouseMoveController);
    this.editor.event.on(EDITOR_EVENT.MOUSE_UP, this.onMouseUpController);
    this.select = new SelectNode(this.editor);
    this.frame = new FrameNode(this.editor, this);
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
    NSBridge.set(this.editor.state.entry, this);
    const createElement = (state: DeltaState) => {
      const element = NSBridge.get(state);
      if (element) return element;
      return new ElementNode(state.id, this.editor, state.toRange());
    };
    while (queue.length) {
      const current = queue.shift();
      if (!current) break;
      const parent = createElement(current);
      NSBridge.set(current, parent);
      for (const state of current.children) {
        queue.push(state);
        const node = createElement(state);
        NSBridge.set(state, node);
        parent.append(node);
      }
    }
    this.append(this.select);
    this.append(this.frame);
    this.append(this.select.refer);
  }

  public getFlatNode(): Node[] {
    // 拖拽状态下不需要匹配
    if (this.engine.grab.grabMode) return [];
    return [...super.getFlatNode(), this];
  }

  public onMouseDown = (e: MouseEvent) => {
    !e.shiftKey && this.editor.selection.clearActiveDeltas();
  };

  private emit<T extends keyof NodeEvent>(target: Node, type: T, event: NodeEvent[T]) {
    const stack: Node[] = [];
    let node: Node | null = target.parent;
    while (node) {
      stack.push(node);
      node = node.parent;
    }
    // 捕获阶段执行的事件
    for (const node of stack.reverse()) {
      if (!event.capture) break;
      const eventFn = node[type as keyof NodeEvent];
      eventFn && eventFn(event);
    }
    // 节点本身 执行即可
    const eventFn = target[type as keyof NodeEvent];
    eventFn && eventFn(event);
    // 冒泡阶段执行的事件
    for (const node of stack) {
      if (!event.bubble) break;
      const eventFn = node[type as keyof NodeEvent];
      eventFn && eventFn(event);
    }
  }

  private onMouseDownController = (e: globalThis.MouseEvent) => {
    const flatNode = this.getFlatNode();
    let hit: Node | null = null;
    const point = Point.from(e, this.editor);
    for (const node of flatNode) {
      if (node.range.include(point)) {
        hit = node;
        break;
      }
    }
    hit && this.emit(hit, NODE_EVENT.MOUSE_DOWN, MouseEvent.from(e, this.editor));
  };

  private onMouseMoveBasic = (e: globalThis.MouseEvent) => {
    const flatNode = this.getFlatNode();
    let hit: ElementNode | ResizeNode | null = null;
    const point = Point.from(e, this.editor);
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
      prev && this.emit(prev, NODE_EVENT.MOUSE_LEAVE, MouseEvent.from(e, this.editor));
      hit && this.emit(hit, NODE_EVENT.MOUSE_ENTER, MouseEvent.from(e, this.editor));
    }
  };
  private onMouseMoveController = throttle(this.onMouseMoveBasic, THE_DELAY, THE_CONFIG);

  private onMouseUpController = (e: globalThis.MouseEvent) => {
    const flatNode = this.getFlatNode();
    let hit: Node | null = null;
    const point = Point.from(e, this.editor);
    for (const node of flatNode) {
      if (node.range.include(point)) {
        hit = node;
        break;
      }
    }
    hit && this.emit(hit, NODE_EVENT.MOUSE_UP, MouseEvent.from(e, this.editor));
  };
}
