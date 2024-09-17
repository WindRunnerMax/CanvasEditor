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
import type { Canvas } from "../index";
import type { NodeEvent } from "../types/event";
import { NODE_EVENT } from "../types/event";
import { THE_CONFIG } from "../utils/constant";

export class Root extends Node {
  /** 鼠标指针位置 */
  public cursor: Point;
  /** Hover 节点 */
  public hover: ElementNode | ResizeNode | null;
  /** 框选节点引用 */
  public readonly frame: FrameNode;
  /** 选择节点引用 */
  public readonly select: SelectNode;

  constructor(private editor: Editor, private engine: Canvas) {
    super(Range.from(0, 0));
    this.hover = null;
    this.cursor = Point.from(0, 0);
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

  public createNodeStateTree() {
    this.clearNodes();
    // 初始化构建整个`Node`状态树
    const queue: DeltaState[] = [];
    queue.push(this.editor.state.entry);
    NSBridge.set(this.editor.state.entry, this);
    const createElement = (state: DeltaState) => {
      const element = NSBridge.get(state);
      if (element) return element;
      return new ElementNode(this.editor, state);
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
  }

  public getFlatNode(isEventCall = true): Node[] {
    // 非默认状态下不需要匹配
    if (!this.engine.isDefaultMode()) return [];
    // 事件调用实际顺序 // 渲染顺序则相反
    const flatNodes: Node[] = [...super.getFlatNode(), this];
    return isEventCall ? flatNodes.filter(node => !node.ignoreEvent) : flatNodes;
  }

  public onMouseDown = (e: MouseEvent) => {
    this.editor.canvas.mask.setCursorState(null);
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
    this.cursor = Point.from(e, this.editor);
    // 非默认状态下不执行事件
    if (!this.engine.isDefaultMode()) return void 0;
    // 按事件顺序获取节点
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
    this.cursor = Point.from(e, this.editor);
    // 非默认状态下不执行事件
    if (!this.engine.isDefaultMode()) return void 0;
    // 按事件顺序获取节点
    const flatNode = this.getFlatNode();
    let next: ElementNode | ResizeNode | null = null;
    const point = Point.from(e, this.editor);
    for (const node of flatNode) {
      // 当前只有`ElementNode`和`ResizeNode`需要触发`Mouse Enter/Leave`事件
      const authorize = node instanceof ElementNode || node instanceof ResizeNode;
      if (authorize && node.range.include(point)) {
        next = node;
        break;
      }
    }
    // 如果命中的节点与先前 Hover 的节点不一致
    if (this.hover !== next) {
      const prev = this.hover;
      this.hover = next;
      if (prev !== null) {
        this.emit(prev, NODE_EVENT.MOUSE_LEAVE, MouseEvent.from(e, this.editor));
        if (prev instanceof ElementNode) {
          this.editor.event.trigger(EDITOR_EVENT.HOVER_LEAVE, { node: prev });
        }
      }
      if (next !== null) {
        this.emit(next, NODE_EVENT.MOUSE_ENTER, MouseEvent.from(e, this.editor));
        if (next instanceof ElementNode) {
          this.editor.event.trigger(EDITOR_EVENT.HOVER_ENTER, { node: next });
        }
      }
    }
  };
  private onMouseMoveController = throttle(this.onMouseMoveBasic, ...THE_CONFIG);

  private onMouseUpController = (e: globalThis.MouseEvent) => {
    // 非默认状态下不执行事件
    if (!this.engine.isDefaultMode()) return void 0;
    // 按事件顺序获取节点
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
