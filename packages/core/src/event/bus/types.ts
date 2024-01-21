import type { DeltaSet } from "sketching-delta";

import type { ElementNode } from "../../canvas/dom/element";
import type { Range } from "../../selection/modules/range";
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
  done: boolean;
};

export type InsertEvent = {
  done: boolean;
};

export type HoverEvent = {
  node: ElementNode;
};

export type CanvasResetEvent = {
  range: Range;
  offsetX: number;
  offsetY: number;
};
