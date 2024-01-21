import type { DeltaLike } from "sketching-delta";
import { Delta } from "sketching-delta";
import { isNumber, isObject } from "sketching-utils";

import { Point } from "./point";

export class Range {
  public readonly start: Point;
  public readonly end: Point;
  constructor(options: { startX: number; startY: number; endX: number; endY: number }) {
    this.start = new Point(options.startX, options.startY);
    this.end = new Point(options.endX, options.endY);
  }

  zoom(size: number) {
    return new Range({
      startX: this.start.x - size,
      startY: this.start.y - size,
      endX: this.end.x + size,
      endY: this.end.y + size,
    });
  }

  compose(range: Range | null) {
    if (!range) return this;
    const { startX, startY, endX, endY } = range.flatten();
    const { startX: startX1, startY: startY1, endX: endX1, endY: endY1 } = this.flatten();
    return new Range({
      startX: Math.min(startX, startX1),
      startY: Math.min(startY, startY1),
      endX: Math.max(endX, endX1),
      endY: Math.max(endY, endY1),
    });
  }

  move(x: number, y: number) {
    return new Range({
      startX: this.start.x + x,
      startY: this.start.y + y,
      endX: this.end.x + x,
      endY: this.end.y + y,
    });
  }

  clone() {
    return new Range({ ...this.flat() });
  }

  flat() {
    return { startX: this.start.x, startY: this.start.y, endX: this.end.x, endY: this.end.y };
  }

  flatten() {
    return this.normalize().flat();
  }

  rect() {
    // 标准化矩形
    const { startX, startY, endX, endY } = this.flat();
    const x = Math.min(startX, endX);
    const y = Math.min(startY, endY);
    const width = Math.abs(endX - startX);
    const height = Math.abs(endY - startY);
    return { x, y, width, height };
  }

  center() {
    const { x, y, width, height } = this.rect();
    return new Point(x + width / 2, y + height / 2);
  }

  normalize() {
    const { x, y, width, height } = this.rect();
    return new Range({ startX: x, startY: y, endX: x + width, endY: y + height });
  }

  in(range: Range) {
    const { startX, startY, endX, endY } = this.flatten();
    const { startX: startX1, startY: startY1, endX: endX1, endY: endY1 } = range.flatten();
    return startX >= startX1 && startY >= startY1 && endX <= endX1 && endY <= endY1;
  }

  intersect(range: Range) {
    const { startX, startY, endX, endY } = this.flatten();
    const { startX: startX1, startY: startY1, endX: endX1, endY: endY1 } = range.flatten();
    // 两个矩形相交 水平方向和垂直方向都相交
    return startX <= endX1 && endX >= startX1 && startY <= endY1 && endY >= startY1;
  }

  include(point: Point) {
    return point.in(this);
  }

  static reset() {
    return Range.from(-999999, -999999, -999999, -999999);
  }

  static from(delta: Delta): Range;
  static from(delta: DeltaLike): Range;
  static from(endX: number, endY: number): Range;
  static from(startX: number, startY: number, endX: number, endY: number): Range;
  static from(a: number | Delta | DeltaLike, b?: number, c?: number, d?: number): Range {
    if (a instanceof Delta) {
      const { x, y, height, width } = a.getRect();
      return Range.from(x, y, x + width, y + height);
    } else if (isObject(a)) {
      const { x, y, height, width } = a;
      return Range.from(x, y, x + width, y + height);
    } else if (isNumber(b) && !isNumber(c) && !isNumber(d)) {
      return new Range({ startX: 0, startY: 0, endX: a, endY: b });
    } else if (isNumber(a) && isNumber(b) && isNumber(c) && isNumber(d)) {
      return new Range({ startX: a, startY: b, endX: c, endY: d });
    }
    return new Range({ startX: 0, startY: 0, endX: 0, endY: 0 });
  }

  static fromRect(x: number, y: number, width: number, height: number) {
    return Range.from(x, y, x + width, y + height);
  }

  static isEqual(origin: Range | null, target: Range | null): boolean {
    if (origin === target) return true;
    if (!origin || !target) return false;
    return Point.isEqual(origin.start, target.start) && Point.isEqual(origin.end, target.end);
  }
}
