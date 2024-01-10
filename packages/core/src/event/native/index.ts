import type { Editor } from "../../editor";
import { EDITOR_STATE } from "../../state/utils/constant";
import type { EventBus } from "../bus";
import { NATIVE_EVENTS } from "./types";

export class NativeEvent {
  constructor(private event: EventBus, private editor: Editor) {}

  private onCompositionStart = (e: CompositionEvent) => {
    this.editor.state.set(EDITOR_STATE.COMPOSING, true);
    this.event.trigger(NATIVE_EVENTS.COMPOSITION_START, e);
  };

  private onCompositionUpdate = (e: CompositionEvent) => {
    this.event.trigger(NATIVE_EVENTS.COMPOSITION_UPDATE, e);
  };

  private onCompositionEnd = (e: CompositionEvent) => {
    this.editor.state.set(EDITOR_STATE.COMPOSING, false);
    this.event.trigger(NATIVE_EVENTS.COMPOSITION_END, e);
  };

  private onCopy = (e: ClipboardEvent) => {
    this.event.trigger(NATIVE_EVENTS.COPY, e);
  };

  private onCut = (e: ClipboardEvent) => {
    this.event.trigger(NATIVE_EVENTS.CUT, e);
  };

  private onPaste = (e: ClipboardEvent) => {
    this.event.trigger(NATIVE_EVENTS.PASTE, e);
  };

  private onKeydown = (e: KeyboardEvent) => {
    this.event.trigger(NATIVE_EVENTS.KEY_DOWN, e);
  };

  private onKeypress = (e: KeyboardEvent) => {
    this.event.trigger(NATIVE_EVENTS.KEY_PRESS, e);
  };

  private onKeyup = (e: KeyboardEvent) => {
    this.event.trigger(NATIVE_EVENTS.KEY_UP, e);
  };

  private onFocus = (e: FocusEvent) => {
    this.editor.state.set(EDITOR_STATE.FOCUS, true);
    this.event.trigger(NATIVE_EVENTS.FOCUS, e);
  };

  private onBlur = (e: FocusEvent) => {
    this.editor.state.set(EDITOR_STATE.FOCUS, false);
    this.event.trigger(NATIVE_EVENTS.BLUR, e);
  };

  private onMouseDown = (e: MouseEvent) => {
    this.editor.state.set(EDITOR_STATE.MOUSE_DOWN, true);
    this.event.trigger(NATIVE_EVENTS.MOUSE_DOWN, e);
  };

  private onMouseMove = (e: MouseEvent) => {
    this.event.trigger(NATIVE_EVENTS.MOUSE_MOVE, e);
  };

  private onMouseUp = (e: MouseEvent) => {
    this.editor.state.set(EDITOR_STATE.MOUSE_DOWN, false);
    this.event.trigger(NATIVE_EVENTS.MOUSE_UP, e);
  };

  private onMouseWheel = (e: WheelEvent) => {
    this.event.trigger(NATIVE_EVENTS.MOUSE_WHEEL, e);
  };

  private onMouseMoveGlobal = (e: MouseEvent) => {
    this.event.trigger(NATIVE_EVENTS.MOUSE_MOVE_GLOBAL, e);
  };

  private onMouseUpGlobal = (e: MouseEvent) => {
    this.editor.state.set(EDITOR_STATE.MOUSE_DOWN, false);
    this.event.trigger(NATIVE_EVENTS.MOUSE_UP_GLOBAL, e);
  };

  public bind() {
    this.unbind();
    const container = this.editor.getContainer();
    container.addEventListener(NATIVE_EVENTS.COMPOSITION_START, this.onCompositionStart);
    container.addEventListener(NATIVE_EVENTS.COMPOSITION_UPDATE, this.onCompositionUpdate);
    container.addEventListener(NATIVE_EVENTS.COMPOSITION_END, this.onCompositionEnd);
    container.addEventListener(NATIVE_EVENTS.COPY, this.onCopy);
    container.addEventListener(NATIVE_EVENTS.CUT, this.onCut);
    container.addEventListener(NATIVE_EVENTS.PASTE, this.onPaste);
    container.addEventListener(NATIVE_EVENTS.KEY_DOWN, this.onKeydown);
    container.addEventListener(NATIVE_EVENTS.KEY_PRESS, this.onKeypress);
    container.addEventListener(NATIVE_EVENTS.KEY_UP, this.onKeyup);
    container.addEventListener(NATIVE_EVENTS.FOCUS, this.onFocus);
    container.addEventListener(NATIVE_EVENTS.BLUR, this.onBlur);
    container.addEventListener(NATIVE_EVENTS.MOUSE_DOWN, this.onMouseDown);
    container.addEventListener(NATIVE_EVENTS.MOUSE_MOVE, this.onMouseMove);
    container.addEventListener(NATIVE_EVENTS.MOUSE_UP, this.onMouseUp);
    container.addEventListener(NATIVE_EVENTS.MOUSE_WHEEL, this.onMouseWheel);
    document.addEventListener(NATIVE_EVENTS.MOUSE_MOVE, this.onMouseMoveGlobal);
    document.addEventListener(NATIVE_EVENTS.MOUSE_UP, this.onMouseUpGlobal);
  }

  public unbind() {
    const container = this.editor.getContainer();
    container.removeEventListener(NATIVE_EVENTS.COMPOSITION_START, this.onCompositionStart);
    container.removeEventListener(NATIVE_EVENTS.COMPOSITION_UPDATE, this.onCompositionUpdate);
    container.removeEventListener(NATIVE_EVENTS.COMPOSITION_END, this.onCompositionEnd);
    container.removeEventListener(NATIVE_EVENTS.KEY_PRESS, this.onKeypress);
    container.removeEventListener(NATIVE_EVENTS.COPY, this.onCopy);
    container.removeEventListener(NATIVE_EVENTS.CUT, this.onCut);
    container.removeEventListener(NATIVE_EVENTS.PASTE, this.onPaste);
    container.removeEventListener(NATIVE_EVENTS.KEY_DOWN, this.onKeydown);
    container.removeEventListener(NATIVE_EVENTS.KEY_UP, this.onKeyup);
    container.removeEventListener(NATIVE_EVENTS.FOCUS, this.onFocus);
    container.removeEventListener(NATIVE_EVENTS.BLUR, this.onBlur);
    container.removeEventListener(NATIVE_EVENTS.MOUSE_DOWN, this.onMouseDown);
    container.removeEventListener(NATIVE_EVENTS.MOUSE_UP, this.onMouseUp);
    container.removeEventListener(NATIVE_EVENTS.MOUSE_MOVE, this.onMouseMove);
    container.removeEventListener(NATIVE_EVENTS.MOUSE_WHEEL, this.onMouseWheel);
    document.removeEventListener(NATIVE_EVENTS.MOUSE_MOVE, this.onMouseMoveGlobal);
    document.removeEventListener(NATIVE_EVENTS.MOUSE_UP, this.onMouseUpGlobal);
  }
}
