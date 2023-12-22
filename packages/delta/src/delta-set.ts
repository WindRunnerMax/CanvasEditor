import type { Delta } from "./delta";
import type { DeltaSetLike, DeltaStatic } from "./types";

export class DeltaSet {
  private deltas: Record<string, Delta>;
  constructor(options: DeltaSetLike) {
    this.deltas = {};
    Object.entries(options).forEach(([key, delta]) => {
      const DeltaType = DeltaSet.DeltaTypeStore[delta.key];
      DeltaType && (this.deltas[key] = DeltaType.create(delta));
    });
  }

  private static DeltaTypeStore: Record<string, DeltaStatic> = {};
  public static register(delta: DeltaStatic) {
    if (!delta.KEY) {
      throw new Error("Please implements DeltaStatic Type");
    }
    DeltaSet.DeltaTypeStore[delta.KEY] = delta;
  }
}
