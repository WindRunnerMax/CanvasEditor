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

  static isEqual(origin: Point | null, target: Point | null): boolean {
    if (origin === target) return true;
    if (!origin || !target) return false;
    return origin.x === target.x && origin.y === target.y;
  }
}
