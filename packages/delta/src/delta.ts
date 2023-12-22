import { DeltaOptions } from "./types";

export abstract class Delta<T = unknown> {
  public abstract readonly key: string;
  public attrs: T;
  private x: number;
  private y: number;
  private width: number;
  private height: number;
  public children: Set<string>;
  public abstract invert: () => void;
  public abstract drawing: () => void;

  public constructor(options: DeltaOptions) {
    const { x, y, width, height } = options;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.children = new Set();
    this.attrs = options.attrs as T;
  }

  public getArea(): number {
    return this.width * this.height;
  }

  public getRect() {
    return { x: this.x, y: this.y };
  }

  public setWidth(width: number) {
    this.width = width;
    return this;
  }

  public setHeight(height: number) {
    this.height = height;
    return this;
  }

  public move(x: number, y: number) {
    this.x = x + this.x;
    this.y = y + this.y;
    return this;
  }

  public moveTo(x: number, y: number) {
    const diffX = x - this.x;
    const diffY = y - this.y;
    this.move(diffX, diffY);
    return this;
  }

  // TODO: toJSON
}
