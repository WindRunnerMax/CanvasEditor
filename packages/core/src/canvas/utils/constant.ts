/* COMPAT: 数值常量如果会被计算出小数值 则尽可能在常量定义时就避免 */

export const RESIZE_OFS = 6;
export const RESIZE_LEN = 12;
export const SELECT_BIAS = 3;
export const REFER_BIAS = 5;
export const FINE_TUNE = 0.5;

export const THE_CONFIG = [30, { trailing: false }] as const;
export const MAX_Z_INDEX = 999999;

export const DRAG_KEY = "DATA";

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

export const CURSOR_TYPE = {
  GRAB: "GRAB",
  GRABBING: "GRABBING",
};
export const CURSOR_STATE = {
  [RESIZE_TYPE.L]: "ew-resize",
  [RESIZE_TYPE.R]: "ew-resize",
  [RESIZE_TYPE.T]: "ns-resize",
  [RESIZE_TYPE.B]: "ns-resize",
  [RESIZE_TYPE.LT]: "nwse-resize",
  [RESIZE_TYPE.RT]: "nesw-resize",
  [RESIZE_TYPE.LB]: "nesw-resize",
  [RESIZE_TYPE.RB]: "nwse-resize",
  [CURSOR_TYPE.GRAB]: "grab",
  [CURSOR_TYPE.GRABBING]: "grabbing",
} as const;
