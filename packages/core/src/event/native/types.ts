export const NATIVE_EVENTS = {
  COMPOSITION_START: "compositionstart",
  COMPOSITION_UPDATE: "compositionupdate",
  COMPOSITION_END: "compositionend",
  COPY: "copy",
  CUT: "cut",
  PASTE: "paste",
  KEY_DOWN: "keydown",
  KEY_PRESS: "keypress",
  KEY_UP: "keyup",
  FOCUS: "focus",
  BLUR: "blur",
  MOUSE_DOWN: "mousedown",
  MOUSE_UP: "mouseup",
  MOUSE_MOVE: "mousemove",
  MOUSE_WHEEL: "wheel",
  MOUSE_UP_GLOBAL: "mouseup-global",
  MOUSE_MOVE_GLOBAL: "mousemove-global",
  DROP: "drop",
  DROP_OVER: "dragover",
  CONTEXT_MENU: "contextmenu",
} as const;

export type NativeEventMap = {
  [NATIVE_EVENTS.COMPOSITION_START]: CompositionEvent;
  [NATIVE_EVENTS.COMPOSITION_UPDATE]: CompositionEvent;
  [NATIVE_EVENTS.COMPOSITION_END]: CompositionEvent;
  [NATIVE_EVENTS.COPY]: ClipboardEvent;
  [NATIVE_EVENTS.CUT]: ClipboardEvent;
  [NATIVE_EVENTS.PASTE]: ClipboardEvent;
  [NATIVE_EVENTS.KEY_DOWN]: KeyboardEvent;
  [NATIVE_EVENTS.KEY_PRESS]: KeyboardEvent;
  [NATIVE_EVENTS.KEY_UP]: KeyboardEvent;
  [NATIVE_EVENTS.FOCUS]: FocusEvent;
  [NATIVE_EVENTS.BLUR]: FocusEvent;
  [NATIVE_EVENTS.MOUSE_DOWN]: MouseEvent;
  [NATIVE_EVENTS.MOUSE_MOVE]: MouseEvent;
  [NATIVE_EVENTS.MOUSE_UP]: MouseEvent;
  [NATIVE_EVENTS.MOUSE_WHEEL]: WheelEvent;
  [NATIVE_EVENTS.MOUSE_MOVE_GLOBAL]: MouseEvent;
  [NATIVE_EVENTS.MOUSE_UP_GLOBAL]: MouseEvent;
  [NATIVE_EVENTS.DROP]: DragEvent;
  [NATIVE_EVENTS.DROP_OVER]: DragEvent;
  [NATIVE_EVENTS.CONTEXT_MENU]: MouseEvent;
};

type NativeEventMapType = typeof NATIVE_EVENTS;
type NativeEventMapKeys = NativeEventMapType[keyof NativeEventMapType];
export type Listener<T extends NativeEventMapKeys> = (value: NativeEventMap[T]) => void;

export type Listeners = {
  [T in NativeEventMapKeys]?: Listener<T>;
};
export type NormalEventHandler = (e: Event) => void;

export const MOUSE_BUTTON = {
  MAIN: 0,
  ROLLER: 1,
  MINOR: 2,
} as const;
