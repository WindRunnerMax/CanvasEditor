import type { Point } from "../../selection/modules/point";
import type { Range } from "../../selection/modules/range";

export const OP_OFS = 5;
export const OP_LEN = 10;
export const SELECT_BIAS = 3;

export const RESIZE_TYPE = {
  L: "L",
  R: "R",
  T: "T",
  B: "B",
  LT: "LT",
  RT: "RT",
  LB: "LB",
  RB: "RB",
} as const;

export const CURSOR_STATE = {
  [RESIZE_TYPE.L]: "ew-resize",
  [RESIZE_TYPE.R]: "ew-resize",
  [RESIZE_TYPE.T]: "ns-resize",
  [RESIZE_TYPE.B]: "ns-resize",
  [RESIZE_TYPE.LT]: "nwse-resize",
  [RESIZE_TYPE.RT]: "nesw-resize",
  [RESIZE_TYPE.LB]: "nesw-resize",
  [RESIZE_TYPE.RB]: "nwse-resize",
} as const;

export const CANVAS_OP = {
  HOVER: "HOVER",
  RESIZE: "RESIZE",
  TRANSLATE: "TRANSLATE",
  FRAME_SELECT: "FRAME_SELECT",
} as const;

export const CANVAS_STATE = {
  OP: "OP",
  HOVER: "HOVER",
  RESIZE: "RESIZE",
  LANDING_POINT: "LANDING_POINT",
  OP_RECT: "OP_RECT",
} as const;

export type CanvasOp = keyof typeof CANVAS_OP;
export type ResizeType = keyof typeof RESIZE_TYPE;
export type CanvasStateKey = keyof typeof CANVAS_STATE;
export type CanvasState = {
  [CANVAS_STATE.OP]?: CanvasOp | null;
  [CANVAS_STATE.HOVER]?: string | null;
  [CANVAS_STATE.RESIZE]?: ResizeType | null;
  [CANVAS_STATE.LANDING_POINT]?: Point | null;
  [CANVAS_STATE.OP_RECT]?: Range | null;
};
