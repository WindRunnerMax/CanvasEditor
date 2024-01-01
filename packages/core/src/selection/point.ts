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

  static from(event: globalThis.MouseEvent) {
    return new Point(event.offsetX, event.offsetY);
  }

  static isEqual(origin: Point | null, target: Point | null): boolean {
    if (origin === target) return true;
    if (!origin || !target) return false;
    return origin.x === target.x && origin.y === target.y;
  }
}
