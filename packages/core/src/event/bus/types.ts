import type { DeltaSet } from "sketching-delta";

import type { Range } from "../../selection/range";
import type { ApplyOptions } from "../../state/utils/types";

export type ContentChangeEvent = {
  current: DeltaSet;
  previous: DeltaSet;
  // TODO: Strict Operation
  changes: unknown;
  effect: string[];
  options: ApplyOptions;
};

export type PaintEvent = {
  deltaId: string;
};

export type SelectionChangeEvent = {
  previous: Range | null;
  current: Range | null;
};

export type ResizeEvent = {
  width: number;
  height: number;
};

export type GrabEvent = {
  state: boolean;
};

export type InsertEvent = {
  state: boolean;
};
