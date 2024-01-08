import { throttle } from "sketching-utils";

import type { Editor } from "../../editor";
import { EDITOR_EVENT } from "../../event/bus/action";
import { Point } from "../../selection/point";
import type { Canvas } from "../index";
import { RESIZE_TYPE, THE_CONFIG, THE_DELAY } from "../utils/constant";

export class DragState {
  private _dragMode: boolean;
  private landing: Point | null;

  constructor(private editor: Editor, private engine: Canvas) {
    this.landing = null;
    this._dragMode = false;
  }

  public get dragMode() {
    return this._dragMode;
  }

  public startDragMode() {
    if (this._dragMode) return void 0;
    this._dragMode = true;
    this.engine.mask.clear();
    this.engine.mask.setCursorState(RESIZE_TYPE.GRAB);
    this.editor.event.on(EDITOR_EVENT.MOUSE_DOWN, this.onMouseDown);
  }

  public closeDragMode() {
    if (!this._dragMode) return void 0;
    this._dragMode = false;
    this.engine.mask.setCursorState(null);
    this.editor.event.off(EDITOR_EVENT.MOUSE_DOWN, this.onMouseDown);
  }

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
    this.engine.translateImmediately(x, y);
  };
  private onMouseMove = throttle(this.onMouseMoveController, THE_DELAY, THE_CONFIG);

  private onMouseUp = () => {
    this.engine.mask.setCursorState(RESIZE_TYPE.GRAB);
    this.editor.event.off(EDITOR_EVENT.MOUSE_MOVE, this.onMouseMove);
    this.editor.event.off(EDITOR_EVENT.MOUSE_UP, this.onMouseUp);
  };
}
