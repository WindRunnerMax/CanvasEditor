import { getUniqueId, isString } from "sketching-utils";

import type { DeltaSet } from "./delta-set";
import type { DeltaAttributes, DeltaOptions, StrictDeltaLike } from "./types";

export abstract class Delta {
  public abstract readonly key: string;
  public readonly id: string;
  protected x: number;
  protected y: number;
  protected z: number;
  protected width: number;
  protected height: number;
  public children: string[];
  public attrs: DeltaAttributes;
  public getDeltaSet?: () => DeltaSet;
  public abstract drawing: (ctx: CanvasRenderingContext2D) => void | Promise<Delta>;

  public constructor(options: DeltaOptions) {
    const { id, x, y, z, width, height } = options;
    this.id = id || getUniqueId();
    this.x = x;
    this.y = y;
    this.z = z || 0;
    this.width = width;
    this.height = height;
    this.attrs = options.attrs || {};
    this.children = [...(options.children || [])];
  }

  public insert(delta: Delta) {
    this.children.push(delta.id);
    return this;
  }

  public removeChild(id: string): Delta;
  public removeChild(delta: Delta): Delta;
  public removeChild(params: string | Delta) {
    const id = isString(params) ? params : params.id;
    this.children.splice(this.children.indexOf(id), 1);
    return this;
  }

  setRect(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
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

  public getAttr(key: string): string | null {
    return this.attrs[key];
  }

  public setAttr(key: string, value: string | null) {
    if (!value) {
      delete this.attrs[key];
    } else {
      this.attrs[key] = String(value);
    }
    return this;
  }

  public getArea(): number {
    return this.width * this.height;
  }

  public getRect() {
    return { x: this.x, y: this.y, width: this.width, height: this.height, z: this.z };
  }

  public getZ() {
    return this.z;
  }

  public setZ(z: number) {
    this.z = z;
  }

  public clone(): this {
    // @ts-expect-error constructor type
    return new this.constructor(this.toJSON());
  }

  public toJSON(): StrictDeltaLike {
    return {
      x: this.x,
      y: this.y,
      z: this.z,
      id: this.id,
      key: this.key,
      width: this.width,
      height: this.height,
      attrs: { ...this.attrs },
      children: Array.from(this.children),
    };
  }
}
