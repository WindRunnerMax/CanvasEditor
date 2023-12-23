import { getUniqueId, isString } from "sketching-utils";

import type { DeltaSet } from "./delta-set";
import type { DeltaLike, DeltaOptions } from "./types";

export abstract class Delta {
  public abstract readonly key: string;
  public readonly id: string;
  private x: number;
  private y: number;
  private width: number;
  private height: number;
  public children: string[];
  public attrs: Record<string, string>;
  public getDeltaSet?: () => DeltaSet;
  public abstract drawing: (ctx: CanvasRenderingContext2D) => void;

  public constructor(options: DeltaOptions) {
    const { id, x, y, width, height } = options;
    this.id = id || getUniqueId();
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.attrs = options.attrs || {};
    this.children = [...(options.children || [])];
  }

  public insert(delta: Delta) {
    this.children.push(delta.id);
    return this;
  }

  public remove(id: string): Delta;
  public remove(delta: Delta): Delta;
  public remove(params: string | Delta) {
    const id = isString(params) ? params : params.id;
    this.children.splice(this.children.indexOf(id), 1);
    return this;
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
    const deltaSet = this.getDeltaSet && this.getDeltaSet();
    if (deltaSet) {
      this.children.forEach(id => {
        const delta = deltaSet.get(id);
        delta && delta.move(x, y);
      });
    }
    return this;
  }

  public moveTo(x: number, y: number) {
    const diffX = x - this.x;
    const diffY = y - this.y;
    this.move(diffX, diffY);
    return this;
  }

  public getArea(): number {
    return this.width * this.height;
  }

  public getRect() {
    return { x: this.x, y: this.y };
  }

  public clone() {
    // @ts-expect-error constructor type
    return new this.constructor(this.toJSON());
  }

  public toJSON(): DeltaLike {
    return {
      x: this.x,
      y: this.y,
      id: this.id,
      key: this.key,
      attrs: this.attrs,
      width: this.width,
      height: this.height,
      children: Array.from(this.children),
    };
  }
}
