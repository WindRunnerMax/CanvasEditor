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

  flat() {
    return { startX: this.start.x, startY: this.start.y, endX: this.end.x, endY: this.end.y };
  }

  clone() {
    return new Range({ ...this.flat() });
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
