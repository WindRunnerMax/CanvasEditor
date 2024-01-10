import { throttle } from "sketching-utils";

import type { Editor } from "../../editor";
import { EDITOR_EVENT } from "../../event/bus/action";
import { Point } from "../../selection/point";
import type { Canvas } from "../index";
import { RESIZE_TYPE, THE_CONFIG, THE_DELAY } from "../utils/constant";

export class Grab {
  private _grab: boolean;
  private landing: Point | null;

  constructor(private editor: Editor, private engine: Canvas) {
    this.landing = null;
    this._grab = false;
    this.editor.event.on(EDITOR_EVENT.MOUSE_WHEEL, this.onTranslate);
  }

  destroy() {
    this.editor.event.off(EDITOR_EVENT.MOUSE_WHEEL, this.onTranslate);
  }

  public get grabMode() {
    return this._grab;
  }

  public start() {
    if (this._grab) return void 0;
    this._grab = true;
    this.engine.mask.clear();
    this.editor.selection.clearActiveDeltas();
    this.engine.mask.setCursorState(RESIZE_TYPE.GRAB);
    this.editor.event.on(EDITOR_EVENT.MOUSE_DOWN, this.onMouseDown);
    this.editor.event.trigger(EDITOR_EVENT.GRAB_STATE, { state: true });
  }

  public close() {
    if (!this._grab) return void 0;
    this._grab = false;
    this.engine.mask.setCursorState(null);
    this.editor.event.off(EDITOR_EVENT.MOUSE_DOWN, this.onMouseDown);
    this.editor.event.trigger(EDITOR_EVENT.GRAB_STATE, { state: false });
  }

  private onTranslate = (e: WheelEvent) => {
    e.preventDefault();
    const { deltaX, deltaY } = e;
    this.translate(deltaX, deltaY);
  };

  public translateImmediately = (x: number, y: number) => {
    const { offsetX, offsetY } = this.engine.getRect();
    this.engine.setOffset(offsetX + x, offsetY + y);
    this.engine.reset();
  };
  public translate = throttle(this.translateImmediately, THE_DELAY, THE_CONFIG);

  private onMouseDown = (event: MouseEvent) => {
    this.engine.mask.setCursorState(RESIZE_TYPE.GRABBING);
    this.editor.event.on(EDITOR_EVENT.MOUSE_MOVE, this.onMouseMove);
    this.editor.event.on(EDITOR_EVENT.MOUSE_UP, this.onMouseUp);
    this.landing = Point.from(event.offsetX, event.offsetY);
  };

  private onMouseMoveController = (event: MouseEvent) => {
    const point = Point.from(event.offsetX, event.offsetY);
    if (!this.landing) {
      this.landing = point;
      return void 0;
    }
    const { x, y } = point.diff(this.landing || point);
    this.landing = point;
    this.translateImmediately(x, y);
  };
  private onMouseMove = throttle(this.onMouseMoveController, THE_DELAY, THE_CONFIG);

  private onMouseUp = () => {
    this.engine.mask.setCursorState(RESIZE_TYPE.GRAB);
    this.editor.event.off(EDITOR_EVENT.MOUSE_MOVE, this.onMouseMove);
    this.editor.event.off(EDITOR_EVENT.MOUSE_UP, this.onMouseUp);
  };
}
