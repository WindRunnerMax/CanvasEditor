import { Delta } from "./delta";
import { DeltaSetLike } from "./types";

export class DeltaSet {
  private static DeltaTypeStore: Record<string, Delta> = {};
  constructor(options: DeltaSetLike) {
    console.log("options", options);
    // TODO: From JSON Through DeltaTypeStore
  }

  public static register(delta: Delta) {
    DeltaSet.DeltaTypeStore[delta.key] = delta;
  }
}
