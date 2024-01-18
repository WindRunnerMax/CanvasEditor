import type { DeltaLike } from "sketching-delta";
import { DeltaSet, Op, OP_TYPE } from "sketching-delta";
import { throttle, TSON } from "sketching-utils";

import type { Editor } from "../../editor";
import { EDITOR_EVENT } from "../../event/bus/action";
import { Point } from "../../selection/modules/point";
import { Range } from "../../selection/modules/range";
import { Node } from "../dom/node";
import type { Canvas } from "../index";
import { DRAG_KEY, MAX_Z_INDEX, THE_DELAY } from "../utils/constant";
import { BLUE_5 } from "../utils/palette";
import { drawRect } from "../utils/shape";

export class Insert {
  private _on: boolean;
  private node: Node | null;
  private landing: Point | null;
  private dragged: Range | null;
  private data: DeltaLike | null;
  private landingClient: Point | null;

  constructor(private editor: Editor, private engine: Canvas) {
    this._on = false;
    this.data = null;
    this.node = null;
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
    this.data = data;
    this.engine.mask.clear();
    this.engine.mask.setCursorState(null);
    this.editor.selection.clearActiveDeltas();
    this.editor.event.on(EDITOR_EVENT.MOUSE_DOWN, this.onMouseDownController);
  }

  public close() {
    if (!this._on) return void 0;
    this._on = false;
    this.data = null;
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
    const node = new Node(this.dragged);
    node.setZ(MAX_Z_INDEX);
    this.node = node;
    node.drawingMask = this.drawingMask.bind(node);
    this.landingClient = Point.from(e.clientX, e.clientY);
    this.bindOpEvents();
  };

  private onMouseMoveBasic = (e: globalThis.MouseEvent) => {
    if (!this.landing || !this.node || !this.landingClient) return void 0;
    const point = Point.from(e.clientX, e.clientY);
    const { x, y } = this.landingClient.diff(point);
    const latest = new Range({
      startX: this.landing.x,
      startY: this.landing.y,
      endX: this.landing.x + x,
      endY: this.landing.y + y,
    }).normalize();
    this.node.setRange(latest);
    // 重绘拖拽过的最大区域
    this.dragged = this.dragged ? this.dragged.compose(latest) : latest;
    this.engine.mask.drawingEffect(this.dragged, { force: true });
  };
  private onMouseMoveController = throttle(this.onMouseMoveBasic, THE_DELAY);

  private onMouseUpController = () => {
    this.unbindOpEvents();
    if (this.node && this.data) {
      this.engine.root.removeChild(this.node);
      const range = this.node.range;
      const rect = range.rect();
      const deltaLike: DeltaLike = {
        ...this.data,
        ...rect,
      };
      const delta = DeltaSet.create(deltaLike);
      delta && this.editor.state.apply(Op.from(OP_TYPE.INSERT, { delta }));
    }
    this.dragged && this.engine.mask.drawingEffect(this.dragged, { force: true });
    this.close();
    this.node = null;
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

  public drawingMask(this: Node, ctx: CanvasRenderingContext2D) {
    console.log("111 :>> ", 111);
    const { x, y, width, height } = this.range.rect();
    drawRect(ctx, { x, y, width, height, borderColor: BLUE_5 });
  }
}
