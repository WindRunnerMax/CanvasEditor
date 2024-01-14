import { isNumber } from "sketching-utils";

import { Editor } from "../../editor";
import type { Range } from "./range";

export class Point {
  public readonly x: number;
  public readonly y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  clone() {
    return new Point(this.x, this.y);
  }

  diff(target: Point) {
    return { x: target.x - this.x, y: target.y - this.y };
  }

  in(range: Range) {
    return (
      this.x >= range.start.x &&
      this.x <= range.end.x &&
      this.y >= range.start.y &&
      this.y <= range.end.y
    );
  }

  static from(x: number, y: number): Point;
  static from(event: globalThis.MouseEvent, editor: Editor): Point;
  static from(a: globalThis.MouseEvent | number, b?: number | Editor): Point {
    if (a instanceof MouseEvent && b instanceof Editor) {
      const { offsetX, offsetY } = b.canvas.getRect();
      return new Point(a.offsetX + offsetX, a.offsetY + offsetY);
    } else if (isNumber(a) && isNumber(b)) {
      return new Point(a, b);
    }
    return new Point(0, 0);
  }

  static isEqual(origin: Point | null, target: Point | null): boolean {
    if (origin === target) return true;
    if (!origin || !target) return false;
    return origin.x === target.x && origin.y === target.y;
  }
}
