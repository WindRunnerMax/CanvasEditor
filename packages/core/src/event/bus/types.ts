import type { DeltaSet } from "sketching-delta";

import type { CanvasStore } from "../../canvas/utils/constant";
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
  deltaId: string;
};

export type SelectionChangeEvent = {
  previous: Range | null;
  current: Range | null;
};

type CanvasStoreKey = keyof Required<CanvasStore>;
type CanvasStateMap = {
  [P in CanvasStoreKey]: { type: P; payload: CanvasStore[P] };
};
export type CanvasStateEvent = CanvasStateMap[keyof CanvasStateMap];
