import type { Delta, DeltaLike } from "sketching-delta";
import { DeltaSet, Op, OP_TYPE } from "sketching-delta";
import { throttle, TSON } from "sketching-utils";

import type { Editor } from "../../editor";
import { EDITOR_EVENT } from "../../event/bus/action";
import { Point } from "../../selection/modules/point";
import { Range } from "../../selection/modules/range";
import type { Canvas } from "../index";
import { DRAG_KEY, THE_CONFIG } from "../utils/constant";

export class Insert {
  private _on: boolean;
  private delta: Delta | null;
  private range: Range | null;
  private landing: Point | null;
  private dragged: Range | null;
  private landingClient: Point | null;

  constructor(private editor: Editor, private engine: Canvas) {
    this._on = false;
    this.delta = null;
    this.range = null;
    this.landing = null;
    this.dragged = null;
    this.landingClient = null;
    this.editor.event.on(EDITOR_EVENT.DROP, this.onDrop);
  }

  destroy() {
    this.editor.event.off(EDITOR_EVENT.DROP, this.onDrop);
  }

  public get on() {
    return this._on;
  }

  public start(data: DeltaLike) {
    if (this._on) return void 0;
    this._on = true;
    this.delta = DeltaSet.create(data);
    this.engine.mask.clear();
    this.engine.mask.setCursorState(null);
    this.editor.selection.clearActiveDeltas();
    this.editor.event.on(EDITOR_EVENT.MOUSE_DOWN, this.onMouseDownController);
  }

  public close() {
    if (!this._on) return void 0;
    this._on = false;
    this.delta = null;
    this.engine.mask.setCursorState(null);
    this.editor.event.trigger(EDITOR_EVENT.INSERT_STATE, { done: true });
    this.editor.event.off(EDITOR_EVENT.MOUSE_DOWN, this.onMouseDownController);
  }

  private bindOpEvents = () => {
    this.editor.event.on(EDITOR_EVENT.MOUSE_UP_GLOBAL, this.onMouseUpController);
    this.editor.event.on(EDITOR_EVENT.MOUSE_MOVE_GLOBAL, this.onMouseMoveController);
  };

  private unbindOpEvents = () => {
    this.editor.event.off(EDITOR_EVENT.MOUSE_UP_GLOBAL, this.onMouseUpController);
    this.editor.event.off(EDITOR_EVENT.MOUSE_MOVE_GLOBAL, this.onMouseMoveController);
  };

  private onMouseDownController = (e: globalThis.MouseEvent) => {
    this.unbindOpEvents();
    const point = Point.from(e, this.editor);
    this.dragged = Range.from(point.x, point.y, point.x, point.y);
    this.landing = Point.from(e, this.editor);
    this.landingClient = Point.from(e.clientX, e.clientY);
    this.bindOpEvents();
  };

  private onMouseMoveBasic = (e: globalThis.MouseEvent) => {
    if (!this.landing || !this.landingClient) return void 0;
    const point = Point.from(e.clientX, e.clientY);
    const { x, y } = this.landingClient.diff(point);
    const latest = new Range({
      startX: this.landing.x,
      startY: this.landing.y,
      endX: this.landing.x + x,
      endY: this.landing.y + y,
    }).normalize();
    this.range = latest;
    // 重绘拖拽过的最大区域
    this.dragged = this.dragged ? this.dragged.compose(latest) : latest;
    this.drawingMask(this.dragged);
  };
  private onMouseMoveController = throttle(this.onMouseMoveBasic, ...THE_CONFIG);

  private onMouseUpController = () => {
    this.unbindOpEvents();
    if (this.range && this.delta) {
      const range = this.range;
      const { x, y, width, height } = range.rect();
      this.delta.setRect(x, y, width, height);
      this.editor.state.apply(Op.from(OP_TYPE.INSERT, { delta: this.delta }));
    }
    this.dragged && this.drawingMask(this.dragged, true);
    this.close();
    this.range = null;
    this.dragged = null;
    this.landing = null;
    this.landingClient = null;
  };

  public onDrop = (e: DragEvent) => {
    const point = Point.from(e, this.editor);
    const payload = e.dataTransfer && e.dataTransfer.getData(DRAG_KEY);
    if (!payload) return void 0;
    const data = TSON.decode<DeltaLike>(payload);
    if (!data) return void 0;
    const deltaLike: DeltaLike = {
      ...data,
      x: point.x,
      y: point.y,
    };
    const delta = DeltaSet.create(deltaLike);
    delta && this.editor.state.apply(Op.from(OP_TYPE.INSERT, { delta }));
  };

  public drawingMask(range: Range, onlyClear = false) {
    this.engine.mask.clear(range.zoom(this.engine.devicePixelRatio));
    if (!onlyClear && this.delta) {
      const ctx = this.engine.mask.ctx;
      const { x, y, width, height } = range.rect();
      this.delta.setRect(x, y, width, height);
      this.delta.drawing(ctx);
    }
  }
}
