import type { DeltaSet } from "sketching-delta";

export type ContentChangeEvent = {
  current: DeltaSet;
  previous: DeltaSet;
  source: string;
  // TODO: Strict Operation
  changes: unknown;
  effect: string[];
};
export type PaintEvent = {
  zoneId: string;
};
