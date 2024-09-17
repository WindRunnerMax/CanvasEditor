import { isEmptyValue, ROOT_DELTA } from "sketching-utils";
import { ORANGE_5 } from "sketching-utils";

import type { Editor } from "../../editor";
import { Range } from "../../selection/modules/range";
import { MAX_Z_INDEX, REFER_BIAS } from "../utils/constant";
import { Shape } from "../utils/shape";
import { Node } from "./node";

export class ReferNode extends Node {
  private matched: boolean;
  private dragged: Range | null;
  private sortedX: number[] = [];
  private sortedY: number[] = [];
  private xLineMap = new Map<number, number[]>();
  private yLineMap = new Map<number, number[]>();

  constructor(private editor: Editor) {
    super(Range.reset());
    this.dragged = null;
    this.matched = false;
    this.setIgnoreEvent(true);
    this.setZ(MAX_Z_INDEX - 1);
  }

  // COMPAT: 避免`Range`变换
  public setRange() {}

  private addToMap(map: Map<number, number[]>, key: number, value: number[]) {
    const prev: number[] = map.get(key) || [];
    // 不标记具体点 只需要取最小值和最大值即可
    const next: number[] = [Math.min(...value, ...prev), Math.max(...value, ...prev)];
    map.set(key, next);
  }

  public onMouseDownController = () => {
    this.matched = false;
    const active = this.editor.selection.getActiveDeltaIds();
    if (!active) return void 0;
    const xLineMap = this.xLineMap;
    const yLineMap = this.yLineMap;
    const deltas = this.editor.state.getDeltasMap();
    deltas.forEach(state => {
      const range = state.toRange().normalize();
      if (active.has(state.id) || this.editor.canvas.isOutside(range) || state.id === ROOT_DELTA) {
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
  };

  /**
   * 拖拽选区的鼠标移动事件
   * @param latest 拖拽选区的最新 Range
   * @description 作为 SelectNode 的子元素 Node 事件
   * 基于父元素的事件调用链执行当前的事件绑定
   * 避免多次对父元素的 Range 修改来保证值唯一
   */
  public onMouseMoveController = (latest: Range) => {
    this.clearNodes();
    if (!latest || !this.editor.canvas.root.select.isDragging) return void 0;
    if (this.sortedX.length === 0 && this.sortedY.length === 0) {
      this.onMouseUpController(); // 取消所有状态
      return void 0;
    }
    // 选中的节点候选`5`个点
    // *       *
    //     *
    // *       *
    const { startX, endX, startY, endY } = latest.flatten();
    const { x: midX, y: midY } = latest.center();
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
    // 吸附偏移 偏移区间为`REFER_BIAS`
    let offsetX: number | null = null;
    let offsetY: number | null = null;
    if (closestXDist < REFER_BIAS) {
      if (this.isNear(closestXDist, distMinX)) {
        offsetX = closestMinX - startX;
      } else if (this.isNear(closestXDist, distMidX)) {
        offsetX = closestMidX - midX;
      } else if (this.isNear(closestXDist, distMaxX)) {
        offsetX = closestMaxX - endX;
      }
    }
    if (closestYDist < REFER_BIAS) {
      if (this.isNear(closestYDist, distMinY)) {
        offsetY = closestMinY - startY;
      } else if (this.isNear(closestYDist, distMidY)) {
        offsetY = closestMidY - midY;
      } else if (this.isNear(closestYDist, distMaxY)) {
        offsetY = closestMaxY - endY;
      }
    }
    if (isEmptyValue(offsetX) && isEmptyValue(offsetY)) {
      // 未命中参考线需要清理
      this.dragged && this.editor.canvas.mask.drawingEffect(this.dragged);
      this.dragged = null;
      return void 0;
    }
    const nextSelection = latest.move(offsetX || 0, offsetY || 0).normalize();
    const prevPaintRange = this.dragged || nextSelection;
    let nextPaintRange = nextSelection.compose(prevPaintRange);
    // 构建参考线节点
    const createReferNode = (range: Range) => {
      nextPaintRange = nextPaintRange.compose(range);
      const node = new Node(range);
      node.setIgnoreEvent(true);
      node.drawingMask = this.drawingMaskDispatch;
      this.append(node);
      this.matched = true;
    };
    // 吸附功能
    const next = nextSelection;
    const nextMid = next.center();
    if (!isEmptyValue(offsetX)) {
      // 垂直参考线 同`X`
      if (this.isNear(offsetX, closestMinX - startX) && this.xLineMap.has(closestMinX)) {
        const ys = this.xLineMap.get(closestMinX) || [-1];
        const minY = Math.min(...ys, next.start.y);
        const maxY = Math.max(...ys, next.end.y);
        const range = Range.from(next.start.x, minY, next.start.x, maxY);
        createReferNode(range);
      }
      if (this.isNear(offsetX, closestMidX - midX) && this.xLineMap.has(closestMidX)) {
        const ys = this.xLineMap.get(closestMidX) || [-1];
        const minY = Math.min(...ys, next.start.y);
        const maxY = Math.max(...ys, next.end.y);
        const range = Range.from(nextMid.x, minY, nextMid.x, maxY);
        createReferNode(range);
      }
      if (this.isNear(offsetX, closestMaxX - endX) && this.xLineMap.has(closestMaxX)) {
        const ys = this.xLineMap.get(closestMaxX) || [-1];
        const minY = Math.min(...ys, next.start.y);
        const maxY = Math.max(...ys, next.end.y);
        const range = Range.from(next.end.x, minY, next.end.x, maxY);
        createReferNode(range);
      }
    }
    if (!isEmptyValue(offsetY)) {
      // 水平参考线 同`Y`
      if (this.isNear(offsetY, closestMinY - startY) && this.yLineMap.has(closestMinY)) {
        const xs = this.yLineMap.get(closestMinY) || [-1];
        const minX = Math.min(...xs, next.start.x);
        const maxX = Math.max(...xs, next.end.x);
        const range = Range.from(minX, next.start.y, maxX, next.start.y);
        createReferNode(range);
      }
      if (this.isNear(offsetY, closestMidY - midY) && this.yLineMap.has(closestMidY)) {
        const xs = this.yLineMap.get(closestMidY) || [-1];
        const minX = Math.min(...xs, next.start.x);
        const maxX = Math.max(...xs, next.end.x);
        const range = Range.from(minX, nextMid.y, maxX, nextMid.y);
        createReferNode(range);
      }
      if (this.isNear(offsetY, closestMaxY - endY) && this.yLineMap.has(closestMaxY)) {
        const xs = this.yLineMap.get(closestMaxY) || [-1];
        const minX = Math.min(...xs, next.start.x);
        const maxX = Math.max(...xs, next.end.x);
        const range = Range.from(minX, next.end.y, maxX, next.end.y);
        createReferNode(range);
      }
    }
    this.dragged = nextPaintRange;
    nextPaintRange && this.editor.canvas.mask.drawingEffect(nextPaintRange);
    return { x: offsetX || 0, y: offsetY || 0 };
  };

  public onMouseUpController = () => {
    this.clear();
    this.matched && this.clearNodes();
    this.dragged && this.editor.canvas.mask.drawingEffect(this.dragged);
    this.dragged = null;
  };

  private getClosestVal = (sorted: number[], target: number) => {
    // 二分查找
    if (sorted.length === 0) return 999;
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

  private isNear = (a: number, b: number) => Math.abs(a - b) < 0.00001;

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
      Shape.rect(ctx, { x, y, width, height, borderColor: ORANGE_5 });
    });
  };
}
