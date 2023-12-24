export class Range {
  public readonly startX: number;
  public readonly startY: number;
  public readonly endX: number;
  public readonly endY: number;
  constructor(options: { startX: number; startY: number; endX: number; endY: number }) {
    this.startX = options.startX;
    this.startY = options.startY;
    this.endX = options.endX;
    this.endY = options.endY;
  }

  clone() {
    return new Range({ ...this });
  }

  static isEqual(origin: Range | null, target: Range | null): boolean {
    if (origin === target) return true;
    if (!origin || !target) return false;
    return (
      origin.startX === target.startX &&
      origin.startY === target.startY &&
      origin.endX === target.endX &&
      origin.endY === target.endY
    );
  }
}
