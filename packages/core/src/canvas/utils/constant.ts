import type { Point } from "../../selection/point";
import type { Range } from "../../selection/range";

export const RESIZE_OFS = 5;
export const RESIZE_LEN = 10;
export const SELECT_BIAS = 3;

export const THE_DELAY = 30;
export const MAX_Z_INDEX = 999999;
export const THE_CONFIG = { trailing: true };

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
  RECT: "RECT",
  HOVER: "HOVER",
  RESIZE: "RESIZE",
  LANDING: "LANDING",
} as const;

export type CanvasOp = keyof typeof CANVAS_OP;
export type ResizeType = keyof typeof RESIZE_TYPE;
export type CanvasStore = {
  [RESIZE_TYPE.L]?: Range | null;
  [RESIZE_TYPE.R]?: Range | null;
  [RESIZE_TYPE.T]?: Range | null;
  [RESIZE_TYPE.B]?: Range | null;
  [RESIZE_TYPE.LT]?: Range | null;
  [RESIZE_TYPE.RT]?: Range | null;
  [RESIZE_TYPE.LB]?: Range | null;
  [RESIZE_TYPE.RB]?: Range | null;
  [CANVAS_STATE.RECT]?: Range | null;
  [CANVAS_STATE.OP]?: CanvasOp | null;
  [CANVAS_STATE.HOVER]?: string | null;
  [CANVAS_STATE.LANDING]?: Point | null;
  [CANVAS_STATE.RESIZE]?: ResizeType | null;
};
