import type { Delta } from "./delta";
import type { DeltaSetLike, DeltaStatic } from "./types";

export class DeltaSet {
  private deltas: Record<string, Delta>;
  constructor(options: DeltaSetLike) {
    this.deltas = {};
    Object.entries(options).forEach(([key, delta]) => {
      const DeltaType = DeltaSet.DeltaTypeStore[delta.key];
      if (DeltaType) {
        const instance = DeltaType.create(delta);
        instance.getDeltaSet = () => this;
        this.deltas[key] = instance;
      }
    });
  }

  getDeltas() {
    return this.deltas;
  }

  get(key: string) {
    // TODO: limit return types with interface extensions
    if (!this.deltas[key]) return null;
    return this.deltas[key];
  }

  add(delta: Delta, targetId?: string) {
    this.deltas[delta.id] = delta;
    if (targetId) {
      const delta = this.get(targetId);
      delta && delta.insert(delta);
    }
    return this;
  }

  remove(delta: Delta, targetId?: string) {
    delete this.deltas[delta.id];
    if (targetId) {
      const delta = this.get(targetId);
      delta && delta.remove(delta);
    }
    return this;
  }

  private static DeltaTypeStore: Record<string, DeltaStatic> = {};
  public static register(delta: DeltaStatic) {
    if (!delta.KEY) {
      throw new Error("Please implements DeltaStatic Type");
    }
    DeltaSet.DeltaTypeStore[delta.KEY] = delta;
  }
}
