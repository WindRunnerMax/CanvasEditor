import type { Point } from "../../selection/modules/point";
import type { Range } from "../../selection/modules/range";

export const OP_OFS = 5;
export const OP_LEN = 10;
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

export enum CANVAS_OP {
  HOVER,
  RESIZE,
  TRANSLATE,
  FRAME_SELECT,
}
export enum CANVAS_STATE {
  OP = 10,
  HOVER = 11,
  RESIZE = 12,
  LANDING_POINT = 13,
  OP_RECT = 14,
}
export type SelectionState = {
  [CANVAS_STATE.OP]?:
    | CANVAS_OP.HOVER
    | CANVAS_OP.RESIZE
    | CANVAS_OP.TRANSLATE
    | CANVAS_OP.FRAME_SELECT
    | null;
  [CANVAS_STATE.HOVER]?: string | null;
  [CANVAS_STATE.RESIZE]?: RESIZE_TYPE | null;
  [CANVAS_STATE.LANDING_POINT]?: Point | null;
  [CANVAS_STATE.OP_RECT]?: Range | null;
};
