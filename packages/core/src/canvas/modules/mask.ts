import { isEmptyValue } from "sketching-utils";

import type { Editor } from "../../editor";
import { EDITOR_EVENT } from "../../event/bus/action";
import type { CanvasStateEvent } from "../../event/bus/types";
import type { Canvas } from "../index";
import { CANVAS_STATE, CURSOR_STATE, OP_LEN } from "../utils/constant";
import { BLUE, LIGHT_BLUE, WHITE } from "../utils/palette";
import { drawArc, drawRect } from "../utils/shape";

export class Mask {
  private canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;

  constructor(private editor: Editor, private engine: Canvas) {
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    this.editor.event.on(EDITOR_EVENT.SELECTION_CHANGE, this.onSelectionChange);
    this.editor.event.on(EDITOR_EVENT.CANVAS_STATE, this.onCanvasStateChange);
  }

  public onMount(dom: HTMLDivElement, ratio: number) {
    const { width, height } = this.engine.getRect();
    this.canvas.width = width * ratio;
    this.canvas.height = height * ratio;
    this.canvas.style.width = width + "px";
    this.canvas.style.height = height + "px";
    this.canvas.style.position = "absolute";
    dom.appendChild(this.canvas);
  }

  public destroy(dom: HTMLDivElement) {
    dom.removeChild(this.canvas);
    this.editor.event.off(EDITOR_EVENT.SELECTION_CHANGE, this.onSelectionChange);
    this.editor.event.off(EDITOR_EVENT.CANVAS_STATE, this.onCanvasStateChange);
  }

  // ====== Drawing Selection ======
  public drawingSelectionBox() {
    const selection = this.editor.selection.get();
    if (!selection) return void 0;
    const { startX, startY, endX, endY } = selection.flat();
    drawRect(this.ctx, {
      x: startX,
      y: startY,
      width: endX - startX,
      height: endY - startY,
      borderColor: BLUE,
      borderWidth: 1,
    });
    const arc = { borderColor: BLUE, fillColor: WHITE, radius: OP_LEN / 2, borderWidth: 2 };
    drawArc(this.ctx, { ...arc, x: startX, y: startY });
    drawArc(this.ctx, { ...arc, x: endX, y: startY });
    drawArc(this.ctx, { ...arc, x: startX, y: endY });
    drawArc(this.ctx, { ...arc, x: endX, y: endY });
  }

  public drawingHoverBox() {
    const hover = this.engine.getState(CANVAS_STATE.HOVER);
    const active = this.editor.selection.getActiveDeltas();
    if (!hover || active.has(hover)) return void 0;
    const delta = this.editor.deltaSet.get(hover);
    if (!delta) return void 0;
    const { x, y, width, height } = delta.getRect();
    drawRect(this.ctx, {
      x: x,
      y: y,
      width: width,
      height: height,
      borderColor: LIGHT_BLUE,
      borderWidth: 1,
    });
  }

  public drawingTranslateBox() {
    const rect = this.engine.getState(CANVAS_STATE.RECT);
    if (!rect) return void 0;
    const { startX, startY, endX, endY } = rect.flat();
    drawRect(this.ctx, {
      x: startX,
      y: startY,
      width: endX - startX,
      height: endY - startY,
      borderColor: BLUE,
      borderWidth: 1,
    });
  }

  public drawingState() {
    this.clear();
    this.ctx.save();
    this.drawingHoverBox();
    this.drawingSelectionBox();
    this.drawingTranslateBox();
    this.ctx.restore();
  }

  private onSelectionChange = () => {
    this.drawingState();
  };

  private onCanvasStateChange = (event: CanvasStateEvent) => {
    // Explicitly declare the type that needs to be re-rendered
    if (event.type === CANVAS_STATE.RESIZE) {
      this.setCursorState();
    } else if (event.type === CANVAS_STATE.HOVER || event.type === CANVAS_STATE.RECT) {
      this.drawingState();
    }
  };

  // ====== Cursor State ======
  public setCursorState() {
    const state = this.engine.getState(CANVAS_STATE.RESIZE);
    this.canvas.style.cursor = isEmptyValue(state) ? "" : CURSOR_STATE[state];
    return this;
  }

  public getCursorState() {
    return this.canvas.style.cursor || null;
  }

  // ====== Canvas Actions ======
  public resetCtx() {
    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    this.ctx.scale(this.engine.devicePixelRatio, this.engine.devicePixelRatio);
  }

  public clear() {
    const { width, height } = this.engine.getRect();
    this.ctx.clearRect(0, 0, width, height);
  }
}
