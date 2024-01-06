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
export type ResizeType = keyof typeof RESIZE_TYPE;

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
