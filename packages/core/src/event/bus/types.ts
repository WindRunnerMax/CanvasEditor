import type { DeltaSet } from "sketching-delta";

import type { Range } from "../../selection/modules/range";
import type { RESIZE_TYPE, SELECTION_STATE } from "../../selection/utils/constant";

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

export type SelectionStateEvent = {
  type?: SELECTION_STATE;
  [SELECTION_STATE.HOVER]?: string | null;
  [SELECTION_STATE.RESIZE]?: RESIZE_TYPE | null;
  [SELECTION_STATE.TRANSLATE]?: boolean | null;
  [SELECTION_STATE.LANDING_POINT]?: { x: number; y: number } | null;
  [SELECTION_STATE.TRANSLATE_RECT]?: Range | null;
  [SELECTION_STATE.FRAME_SELECT]?: boolean | null;
};
