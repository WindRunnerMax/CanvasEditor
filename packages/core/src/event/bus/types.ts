import type { DeltaSet } from "sketching-delta";

import type { Range } from "../../selection/modules/range";

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
export type SelectionChangeEvent = {
  previous: Range | null;
  current: Range | null;
};
