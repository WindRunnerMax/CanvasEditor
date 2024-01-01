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

  static from(startX: number, startY: number, endX: number, endY: number) {
    return new Range({ startX, startY, endX, endY });
  }

  static isEqual(origin: Range | null, target: Range | null): boolean {
    if (origin === target) return true;
    if (!origin || !target) return false;
    return Point.isEqual(origin.start, target.start) && Point.isEqual(origin.end, target.end);
  }
}
