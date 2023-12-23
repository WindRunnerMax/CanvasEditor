import { isString } from "sketching-utils";

import type { Delta } from "./delta";
import type { DeltaLike, DeltaSetLike, DeltaStatic } from "./types";

export class DeltaSet {
  private deltas: Record<string, Delta>;
  constructor(options: DeltaSetLike) {
    this.deltas = {};
    Object.entries(options).forEach(([id, delta]) => {
      const instance = DeltaSet.create(delta);
      if (instance) {
        instance.getDeltaSet = () => this;
        this.deltas[id] = instance;
      }
    });
  }

  public getDeltas(): DeltaSetLike {
    return Object.keys(this.deltas)
      .filter(key => this.deltas[key])
      .reduce((pre, cur) => ({ ...pre, [cur]: this.deltas[cur].toJSON() }), {} as DeltaSetLike);
  }

  public get(key: string) {
    // TODO: Limit Return Types With Interface Extensions
    if (!this.deltas[key]) return null;
    return this.deltas[key];
  }

  public add(delta: Delta, to?: string) {
    this.deltas[delta.id] = delta;
    delta.getDeltaSet = () => this;
    if (to) {
      const delta = this.get(to);
      delta && delta.insert(delta);
    }
    return this;
  }

  public remove(id: string, from?: string): this;
  public remove(delta: Delta, from?: string): this;
  public remove(params: string | Delta, from?: string) {
    const id = isString(params) ? params : params.id;
    delete this.deltas[id];
    if (from) {
      const delta = this.get(from);
      delta && delta.remove(delta);
    }
    return this;
  }

  forEach(cb: (id: string, delta: Delta) => void) {
    for (const [id, delta] of Object.entries(this.deltas)) {
      cb(id, delta);
    }
  }

  private static DeltaTypeStore: Record<string, DeltaStatic> = {};
  public static register(delta: DeltaStatic) {
    if (!delta.KEY) {
      throw new TypeError("Please implements DeltaStatic Type");
    }
    DeltaSet.DeltaTypeStore[delta.KEY] = delta;
  }
  public static create(delta: DeltaLike) {
    const DeltaType = DeltaSet.DeltaTypeStore[delta.key];
    return DeltaType ? DeltaType.create(delta) : null;
  }
}
