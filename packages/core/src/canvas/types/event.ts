import type { MouseEvent } from "../event/mouse";

export type EventOptions = { bubble?: boolean; capture?: boolean };

export const NODE_EVENT = {
  MOUSE_DOWN: "onMouseDown",
  MOUSE_UP: "onMouseUp",
  MOUSE_ENTER: "onMouseEnter",
  MOUSE_LEAVE: "onMouseLeave",
} as const;

export type NodeEvent = {
  [NODE_EVENT.MOUSE_DOWN]: MouseEvent;
  [NODE_EVENT.MOUSE_UP]: MouseEvent;
  [NODE_EVENT.MOUSE_ENTER]: MouseEvent;
  [NODE_EVENT.MOUSE_LEAVE]: MouseEvent;
};
