import type { NativeEventMap } from "../native/types";
import { NATIVE_EVENTS } from "../native/types";
import type {
  ContentChangeEvent,
  PaintEvent,
  SelectionChangeEvent,
  SelectionStateEvent,
} from "./types";

export const EDITOR_EVENT = {
  CONTENT_CHANGE: "CONTENT_CHANGE",
  SELECTION_STATE: "SELECTION_STATE",
  SELECTION_CHANGE: "SELECTION_CHANGE",
  PAINT: "PAINT",
  ...NATIVE_EVENTS,
} as const;

export type EventMap = {
  [EDITOR_EVENT.PAINT]: PaintEvent;
  [EDITOR_EVENT.CONTENT_CHANGE]: ContentChangeEvent;
  [EDITOR_EVENT.SELECTION_STATE]: SelectionStateEvent;
  [EDITOR_EVENT.SELECTION_CHANGE]: SelectionChangeEvent;
} & NativeEventMap;

type EventMapType = typeof EDITOR_EVENT;
export type EventMapKeys = EventMapType[keyof EventMapType];

export type MapToArray<T> = T extends EventMapKeys ? [key: T, payload: EventMap[T]] : never;
export type EditorEventAction = MapToArray<EventMapKeys>;

export type MapToRecord<T extends EventMapKeys> = {
  [P in T]: { key: P; payload: EventMap[P] };
};
export type EditorEventRecord = MapToRecord<EventMapKeys>;
