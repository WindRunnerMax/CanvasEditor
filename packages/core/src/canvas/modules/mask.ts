import type { Editor } from "../../editor";
import { EDITOR_EVENT } from "../../event/bus/action";
import type { Canvas } from "../index";
import { OP_LEN, OP_OFS } from "../utils/constant";
import { BLUE, LIGHT_BLUE, WHITE } from "../utils/palette";

export class Mask {
  private canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;

  constructor(private editor: Editor, private engine: Canvas) {
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    this.editor.event.on(EDITOR_EVENT.SELECTION_CHANGE, this.onSelectionChange);
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
  }

  public drawingSelectionBox() {
    const selection = this.editor.selection.get();
    if (!selection) return void 0;
    const { startX, startY, endX, endY } = selection;
    this.ctx.beginPath();
    this.ctx.rect(startX - 1, startY - 1, endX - startX + 2, endY - startY + 2);
    this.ctx.strokeStyle = BLUE;
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    this.ctx.closePath();
    this.ctx.beginPath();
    this.ctx.rect(startX - OP_OFS, startX - OP_OFS, OP_LEN, OP_LEN);
    this.ctx.rect(endX - OP_OFS, startY - OP_OFS, OP_LEN, OP_LEN);
    this.ctx.rect(startX - OP_OFS, endY - OP_OFS, OP_LEN, OP_LEN);
    this.ctx.rect(endX - OP_OFS, endY - OP_OFS, OP_LEN, OP_LEN);
    this.ctx.fillStyle = WHITE;
    this.ctx.fill();
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = BLUE;
    this.ctx.stroke();
    this.ctx.closePath();
  }

  public drawingHoverBox() {
    const hover = this.editor.selection.getHoverDelta();
    const active = this.editor.selection.getActiveDeltas();
    if (!hover || active.has(hover)) return void 0;
    const delta = this.editor.deltaSet.get(hover);
    if (!delta) return void 0;
    const { x, y, width, height } = delta.getRect();
    this.ctx.beginPath();
    this.ctx.rect(x - 1, y - 1, width + 2, height + 2);
    this.ctx.strokeStyle = LIGHT_BLUE;
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    this.ctx.closePath();
  }

  public drawingState() {
    this.clear();
    this.ctx.save();
    this.drawingHoverBox();
    this.drawingSelectionBox();
    this.ctx.restore();
  }

  private onSelectionChange = () => {
    this.drawingState();
  };

  public resetCtx() {
    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    this.ctx.scale(this.engine.devicePixelRatio, this.engine.devicePixelRatio);
  }

  public clear() {
    const { width, height } = this.engine.getRect();
    this.ctx.clearRect(0, 0, width, height);
  }
}
