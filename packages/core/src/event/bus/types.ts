import type { DeltaSet } from "sketching-delta";

import type { CANVAS_STATE } from "../../canvas/utils/constant";
import type { SelectionState } from "../../canvas/utils/constant";
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

type SelectionStateMap = {
  [P in CANVAS_STATE]: { type: P; payload: SelectionState[P] };
};
export type SelectionStateEvent = SelectionStateMap[keyof SelectionStateMap];
