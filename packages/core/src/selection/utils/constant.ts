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

export enum SELECTION_STATE {
  HOVER,
  RESIZE,
  TRANSLATE,
  LANDING_POINT,
  TRANSLATE_RECT,
  FRAME_SELECT,
}
