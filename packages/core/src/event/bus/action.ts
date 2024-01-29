import type { NativeEventMap } from "../native/types";
import { NATIVE_EVENTS } from "../native/types";
import type {
  CanvasResetEvent,
  ContentChangeEvent,
  GrabEvent,
  HoverEvent,
  InsertEvent,
  MountEvent,
  PaintEvent,
  ReadonlyStateEvent,
  ResizeEvent,
  SelectionChangeEvent,
} from "./types";

export const EDITOR_EVENT = {
  CONTENT_CHANGE: "CONTENT_CHANGE",
  SELECTION_CHANGE: "SELECTION_CHANGE",
  PAINT: "PAINT",
  RESIZE: "RESIZE",
  GRAB_STATE: "GRAB_STATE",
  INSERT_STATE: "INSERT_STATE",
  HOVER_ENTER: "HOVER_ENTER",
  HOVER_LEAVE: "HOVER_LEAVE",
  CANVAS_RESET: "CANVAS_RESET",
  MOUNT: "MOUNT",
  READONLY_CHANGE: "READONLY_CHANGE",
  ...NATIVE_EVENTS,
} as const;

export type EventMap = {
  [EDITOR_EVENT.PAINT]: PaintEvent;
  [EDITOR_EVENT.CONTENT_CHANGE]: ContentChangeEvent;
  [EDITOR_EVENT.SELECTION_CHANGE]: SelectionChangeEvent;
  [EDITOR_EVENT.RESIZE]: ResizeEvent;
  [EDITOR_EVENT.GRAB_STATE]: GrabEvent;
  [EDITOR_EVENT.INSERT_STATE]: InsertEvent;
  [EDITOR_EVENT.HOVER_ENTER]: HoverEvent;
  [EDITOR_EVENT.HOVER_LEAVE]: HoverEvent;
  [EDITOR_EVENT.CANVAS_RESET]: CanvasResetEvent;
  [EDITOR_EVENT.MOUNT]: MountEvent;
  [EDITOR_EVENT.READONLY_CHANGE]: ReadonlyStateEvent;
} & NativeEventMap;

type EventMapType = typeof EDITOR_EVENT;
export type EventMapKeys = EventMapType[keyof EventMapType];

export type MapToArray<T> = T extends EventMapKeys ? [key: T, payload: EventMap[T]] : never;
export type EditorEventAction = MapToArray<EventMapKeys>;

export type MapToRecord<T extends EventMapKeys> = {
  [P in T]: { key: P; payload: EventMap[P] };
};
export type EditorEventRecord = MapToRecord<EventMapKeys>;
