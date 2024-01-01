import { throttle } from "sketching-utils";

import type { Editor } from "../../editor";
import { EDITOR_EVENT } from "../../event/bus/action";
import { Range } from "../../selection/range";
import { MouseEvent } from "../dom/event";
import { Node } from "../dom/node";
import { isPointInRange } from "../utils/is";
import { ROOT_TO_NODE } from "./map";

export class Root extends Node {
  constructor(private editor: Editor) {
    const range = Range.from(0, 0, 0, 0);
    super(range);
    this.editor.event.on(EDITOR_EVENT.MOUSE_DOWN, this.onMouseDownController);
    this.editor.event.on(EDITOR_EVENT.MOUSE_MOVE, this.onMouseMoveController);
    this.editor.event.on(EDITOR_EVENT.MOUSE_UP, this.onMouseUpController);
  }

  private emit(
    node: Node,
    type: "onMouseDown" | "onMouseUp" | "onMouseEnter" | "onMouseLeave",
    event: MouseEvent
  ) {
    const store = new WeakSet<Node>();
    const depthTraversal = (current: Node, depth: number) => {
      if (store.has(current)) return void 0;
      const eventFn = current[type];
      for (const node of current.children) {
        if (store.has(node)) continue;
        store.add(node);
        eventFn && eventFn(event);
        if (current === node) {
          break;
        }
        depthTraversal(node, depth + 1);
        eventFn && event.bubble && eventFn(event);
      }
    };
    depthTraversal(this, 0);
  }

  private getFlatNode = () => {
    const cache = ROOT_TO_NODE.get(this);
    if (cache) return cache;
    const queue: Node[] = [];
    const result: Node[] = [];
    queue.push(this);
    while (queue.length) {
      const current = queue.shift();
      if (!current) break;
      current !== this && result.unshift(current);
      for (const node of current.children) {
        queue.push(node);
      }
    }
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
      let hit: Node | null = null;
      for (const node of flatNode) {
        if (isPointInRange(e.offsetX, e.offsetY, node.range)) {
          hit = node;
          break;
        }
      }
      hit && this.emit(hit, "onMouseEnter", new MouseEvent(e));
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

  destroy() {
    this.editor.event.off(EDITOR_EVENT.MOUSE_DOWN, this.onMouseDownController);
    this.editor.event.off(EDITOR_EVENT.MOUSE_MOVE, this.onMouseMoveController);
    this.editor.event.off(EDITOR_EVENT.MOUSE_UP, this.onMouseUpController);
  }
}
