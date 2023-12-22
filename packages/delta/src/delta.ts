import type { DeltaOptions } from "./types";

export abstract class Delta {
  public abstract readonly key: string;
  private x: number;
  private y: number;
  private width: number;
  private height: number;
  public children: Set<string>;
  public attrs: Record<string, string>;
  public abstract invert: () => void;
  public abstract drawing: () => void;

  public constructor(options: DeltaOptions) {
    const { x, y, width, height } = options;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.attrs = options.attrs || {};
    this.children = new Set(options.children);
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

  public toJSON() {
    return {
      x: this.x,
      y: this.y,
      key: this.key,
      attrs: this.attrs,
      width: this.width,
      height: this.height,
      children: Array.from(this.children),
    };
  }
}
