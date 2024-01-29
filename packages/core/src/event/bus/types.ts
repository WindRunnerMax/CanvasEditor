import type { DeltaSet, OpSetType } from "sketching-delta";

import type { ElementNode } from "../../canvas/dom/element";
import type { Range } from "../../selection/modules/range";
import type { ApplyOptions } from "../../state/utils/types";

export type ContentChangeEvent = {
  current: DeltaSet;
  previous: DeltaSet;
  changes: OpSetType;
  options: ApplyOptions;
};

// eslint-disable-next-line @typescript-eslint/ban-types
export type PaintEvent = {};
// eslint-disable-next-line @typescript-eslint/ban-types
export type MountEvent = {};

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

export type ReadonlyStateEvent = {
  prev: boolean;
  next: boolean;
};
