import { throttle } from "sketching-utils";

import type { Editor } from "../../editor";
import { EDITOR_EVENT } from "../../event/bus/action";
import { Point } from "../../selection/modules/point";
import type { Canvas } from "../index";
import { CURSOR_TYPE, THE_CONFIG } from "../utils/constant";

export class Grab {
  private _on: boolean;
  private disable: boolean;
  private landing: Point | null;

  constructor(private editor: Editor, private engine: Canvas) {
    this.landing = null;
    this._on = false;
    this.disable = false;
    this.editor.event.on(EDITOR_EVENT.MOUSE_WHEEL, this.onTranslate);
  }

  destroy() {
    this.editor.event.off(EDITOR_EVENT.MOUSE_WHEEL, this.onTranslate);
  }

  public get on() {
    return this._on;
  }

  public setState(enable: boolean) {
    this.disable = !enable;
  }

  public start() {
    if (this._on || this.disable) return void 0;
    this.engine.mask.clearWithOp();
    this._on = true;
    this.engine.mask.setCursorState(CURSOR_TYPE.GRAB);
    this.editor.event.on(EDITOR_EVENT.MOUSE_DOWN, this.onMouseDown);
  }

  public close() {
    if (!this._on) return void 0;
    this._on = false;
    this.engine.mask.setCursorState(null);
    this.editor.event.off(EDITOR_EVENT.MOUSE_DOWN, this.onMouseDown);
    this.editor.event.trigger(EDITOR_EVENT.GRAB_STATE, { done: true });
  }

  private onTranslate = (e: WheelEvent) => {
    if (this.disable) return void 0;
    e.preventDefault();
    const { deltaX, deltaY } = e;
    this.translate(deltaX, deltaY);
  };

  public translateImmediately = (x: number, y: number) => {
    if (this.disable) return void 0;
    const { offsetX, offsetY } = this.engine.getRect();
    this.engine.setOffset(offsetX + x, offsetY + y);
    this.engine.reset();
  };

  public translate: (x: number, y: number) => void = throttle(
    this.translateImmediately,
    ...THE_CONFIG
  );

  private onMouseDown = (event: MouseEvent) => {
    this.engine.mask.setCursorState(CURSOR_TYPE.GRABBING);
    this.editor.event.on(EDITOR_EVENT.MOUSE_MOVE_GLOBAL, this.onMouseMove);
    this.editor.event.on(EDITOR_EVENT.MOUSE_UP_GLOBAL, this.onMouseUp);
    this.landing = Point.from(event.clientX, event.clientY);
  };

  private onMouseMoveBasic = (event: MouseEvent) => {
    const point = Point.from(event.clientX, event.clientY);
    if (!this.landing) {
      this.landing = point;
      return void 0;
    }
    const { x, y } = point.diff(this.landing || point);
    this.landing = point;
    this.translateImmediately(x, y);
  };
  private onMouseMove = throttle(this.onMouseMoveBasic, ...THE_CONFIG);

  private onMouseUp = () => {
    this.engine.mask.setCursorState(CURSOR_TYPE.GRAB);
    this.editor.event.off(EDITOR_EVENT.MOUSE_MOVE_GLOBAL, this.onMouseMove);
    this.editor.event.off(EDITOR_EVENT.MOUSE_UP_GLOBAL, this.onMouseUp);
  };
}
