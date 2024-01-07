import { throttle } from "sketching-utils";

import type { Editor } from "../../editor";
import { EDITOR_EVENT } from "../../event/bus/action";
import { Range } from "../../selection/range";
import { Node } from "../dom/node";
import { THE_CONFIG, THE_DELAY } from "../utils/constant";
import { ORANGE_5 } from "../utils/palette";
import { drawRect } from "../utils/shape";

export class ReferNode extends Node {
  private dragged: Range | null;
  private sortedX: number[] = [];
  private sortedY: number[] = [];
  private xLineMap = new Map<number, number[]>();
  private yLineMap = new Map<number, number[]>();

  constructor(private editor: Editor) {
    super(Range.reset());
    this.dragged = null;
    this.editor.event.on(EDITOR_EVENT.MOUSE_DOWN, this.onMouseDownController, 101);
  }

  destroy() {
    this.editor.event.off(EDITOR_EVENT.MOUSE_DOWN, this.onMouseDownController);
  }

  private addToMap(map: Map<number, number[]>, key: number, value: number[]) {
    const list = map.get(key) || [];
    list.push(...value);
    map.set(key, list);
  }

  private onMouseDownController = () => {
    const active = this.editor.selection.getActiveDeltas();
    if (!active) return void 0;
    const xLineMap = this.xLineMap;
    const yLineMap = this.yLineMap;
    const deltas = this.editor.state.getDeltas();
    deltas.forEach(state => {
      const range = state.toRange().normalize();
      if (active.has(state.id) || this.editor.canvas.isOutside(range)) {
        return void 0;
      }
      const { startX, endX, startY, endY } = range.flat();
      const { x: midX, y: midY } = range.center();
      // 非选中的节点收集`8`个点
      // *   *   *
      // *       *
      // *   *   *
      // `Point x [y1, y2] -> (x, y1) (x, y2)`
      this.addToMap(xLineMap, startX, [startY, endY]);
      this.addToMap(xLineMap, midX, [startY, endY]);
      this.addToMap(xLineMap, endX, [startY, endY]);
      // `Point y [x1, x2] -> (x1, y) (x2, y)`
      this.addToMap(yLineMap, startY, [startX, endX]);
      this.addToMap(yLineMap, midY, [startX, endX]);
      this.addToMap(yLineMap, endY, [startX, endX]);
    });
    this.sortedX = Array.from(xLineMap.keys()).sort((a, b) => a - b);
    this.sortedY = Array.from(yLineMap.keys()).sort((a, b) => a - b);
    this.editor.event.on(EDITOR_EVENT.MOUSE_UP, this.onMouseUpController, 101);
    this.editor.event.on(EDITOR_EVENT.MOUSE_MOVE, this.onMouseMoveController, 101);
  };

  private onMouseMoveBridge = () => {
    this.clearNodes();
    // COMPAT: 选区非实时更新 需要取得`SelectNode`选区
    const selection = this.editor.canvas.root.select.range;
    if (!selection || !this.editor.canvas.root.select.isDragging) return void 0;
    // 选中的节点候选`5`个点
    // *       *
    //     *
    // *       *
    const { startX, endX, startY, endY } = selection.flatten();
    const { x: midX, y: midY } = selection.center();
    // 分别找到目标图形的最近的参考线
    const closestMinX = this.getClosestVal(this.sortedX, startX);
    const closestMidX = this.getClosestVal(this.sortedX, midX);
    const closestMaxX = this.getClosestVal(this.sortedX, endX);
    const closestMinY = this.getClosestVal(this.sortedY, startY);
    const closestMidY = this.getClosestVal(this.sortedY, midY);
    const closestMaxY = this.getClosestVal(this.sortedY, endY);
    // 分别计算出距离
    const distMinX = Math.abs(closestMinX - startX);
    const distMidX = Math.abs(closestMidX - midX);
    const distMaxX = Math.abs(closestMaxX - endX);
    const distMinY = Math.abs(closestMinY - startY);
    const distMidY = Math.abs(closestMidY - midY);
    const distMaxY = Math.abs(closestMaxY - endY);
    // 找到最近距离
    const closestXDist = Math.min(distMinX, distMidX, distMaxX);
    const closestYDist = Math.min(distMinY, distMidY, distMaxY);
    const composeNodeRange = (range: Range) => {
      this.dragged = this.dragged ? this.dragged.compose(range) : range;
      const node = new Node(range);
      node.drawingMask = this.drawingMaskDispatch;
      this.append(node);
    };
    // TODO: 吸附功能(SELECT_BIAS) 暂时只实现绘制参考线(0)
    if (closestXDist === 0) {
      // 垂直参考线 同`X`
      if (distMinX === 0 && this.xLineMap.has(closestMinX)) {
        const ys = this.xLineMap.get(closestMinX) || [-1];
        const minY = Math.min(...ys, startY);
        const maxY = Math.max(...ys, endY);
        const range = Range.from(startX, minY, startX, maxY);
        composeNodeRange(range);
      }
      if (distMidX === 0 && this.xLineMap.has(closestMidX)) {
        const ys = this.xLineMap.get(closestMidX) || [-1];
        const minY = Math.min(...ys, startY);
        const maxY = Math.max(...ys, endY);
        const range = Range.from(midX, minY, midX, maxY);
        composeNodeRange(range);
      }
      if (distMaxX === 0 && this.xLineMap.has(closestMaxX)) {
        const ys = this.xLineMap.get(closestMaxX) || [-1];
        const minY = Math.min(...ys, startY);
        const maxY = Math.max(...ys, endY);
        const range = Range.from(endX, minY, endX, maxY);
        composeNodeRange(range);
      }
    }
    if (closestYDist === 0) {
      // 水平参考线 同`Y`
      if (distMinY === 0 && this.yLineMap.has(closestMinY)) {
        const xs = this.yLineMap.get(closestMinY) || [-1];
        const minX = Math.min(...xs, startX);
        const maxX = Math.max(...xs, endX);
        const range = Range.from(minX, startY, maxX, startY);
        composeNodeRange(range);
      }
      if (distMidY === 0 && this.yLineMap.has(closestMidY)) {
        const xs = this.yLineMap.get(closestMidY) || [-1];
        const minX = Math.min(...xs, startX);
        const maxX = Math.max(...xs, endX);
        const range = Range.from(minX, midY, maxX, midY);
        composeNodeRange(range);
      }
      if (distMaxY === 0 && this.yLineMap.has(closestMaxY)) {
        const xs = this.yLineMap.get(closestMaxY) || [-1];
        const minX = Math.min(...xs, startX);
        const maxX = Math.max(...xs, endX);
        const range = Range.from(minX, endY, maxX, endY);
        composeNodeRange(range);
      }
    }
    this.dragged && this.editor.canvas.mask.drawingEffect(this.dragged);
  };
  private onMouseMoveController = throttle(this.onMouseMoveBridge, THE_DELAY, THE_CONFIG);

  private onMouseUpController = () => {
    this.clear();
    this.clearNodes();
    this.dragged && this.editor.canvas.mask.drawingEffect(this.dragged);
    this.editor.event.off(EDITOR_EVENT.MOUSE_UP, this.onMouseUpController);
    this.editor.event.off(EDITOR_EVENT.MOUSE_MOVE, this.onMouseMoveController);
    this.dragged = null;
  };

  private getClosestVal = (sorted: number[], target: number) => {
    // 二分查找
    if (sorted.length === 0) return -1;
    if (sorted.length === 1) return sorted[0];
    let left = 0;
    let right = sorted.length - 1;
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      if (sorted[mid] === target) {
        return sorted[mid];
      } else if (sorted[mid] < target) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
    if (left >= sorted.length) return sorted[right];
    if (right < 0) return sorted[left];
    return Math.abs(sorted[right] - target) <= Math.abs(sorted[left] - target)
      ? sorted[right]
      : sorted[left];
  };

  private clear() {
    this.sortedX = [];
    this.sortedY = [];
    this.xLineMap.clear();
    this.yLineMap.clear();
  }

  public drawingMaskDispatch = (ctx: CanvasRenderingContext2D) => {
    if (!this.editor.canvas.root.select.isDragging) return void 0;
    this.children.forEach(node => {
      const { x, y, width, height } = node.range.rect();
      drawRect(ctx, { x, y, width, height, borderColor: ORANGE_5 });
    });
  };
}
