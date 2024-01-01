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

  compose(range: Range) {
    const { startX, startY, endX, endY } = range.flat();
    const { startX: startX1, startY: startY1, endX: endX1, endY: endY1 } = this.flat();
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

  rect() {
    return {
      x: this.start.x,
      y: this.start.y,
      width: this.end.x - this.start.x,
      height: this.end.y - this.start.y,
    };
  }

  center() {
    const { x, y, width, height } = this.rect();
    return new Point(x + width / 2, y + height / 2);
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

  static isEqual(origin: Range | null, target: Range | null): boolean {
    if (origin === target) return true;
    if (!origin || !target) return false;
    return Point.isEqual(origin.start, target.start) && Point.isEqual(origin.end, target.end);
  }
}
