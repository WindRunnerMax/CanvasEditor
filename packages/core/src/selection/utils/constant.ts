import type { Point } from "../modules/point";
import type { Range } from "../modules/range";

export const SELECT_BIAS = 3;

export enum RESIZE_TYPE {
  L,
  R,
  T,
  B,
  LT,
  RT,
  LB,
  RB,
}

export const CURSOR_STATE = {
  [RESIZE_TYPE.L]: "ew-resize",
  [RESIZE_TYPE.R]: "ew-resize",
  [RESIZE_TYPE.T]: "ns-resize",
  [RESIZE_TYPE.B]: "ns-resize",
  [RESIZE_TYPE.LT]: "nwse-resize",
  [RESIZE_TYPE.RT]: "nesw-resize",
  [RESIZE_TYPE.LB]: "nesw-resize",
  [RESIZE_TYPE.RB]: "nwse-resize",
};

export enum SELECTION_OP {
  HOVER,
  RESIZE,
  TRANSLATE,
  FRAME_SELECT,
}
export enum SELECTION_STATE {
  OP = 10,
  HOVER = 11,
  RESIZE = 12,
  LANDING_POINT = 13,
  OP_RECT = 14,
}
export type SelectionState = {
  [SELECTION_STATE.OP]?:
    | SELECTION_OP.HOVER
    | SELECTION_OP.RESIZE
    | SELECTION_OP.TRANSLATE
    | SELECTION_OP.FRAME_SELECT
    | null;
  [SELECTION_STATE.HOVER]?: string | null;
  [SELECTION_STATE.RESIZE]?: RESIZE_TYPE | null;
  [SELECTION_STATE.LANDING_POINT]?: Point | null;
  [SELECTION_STATE.OP_RECT]?: Range | null;
};
