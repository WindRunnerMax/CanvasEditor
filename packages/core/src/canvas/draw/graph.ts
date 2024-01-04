import type { Editor } from "../../editor";
import type { Canvas } from "../index";

export class Graph {
  private canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;

  constructor(private editor: Editor, private engine: Canvas) {
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
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
  }

  public drawingAll() {
    this.clear();
    const { width: canvasWidth, height: canvasHeight } = this.engine.getRect();
    this.editor.state.getDeltas().forEach(state => {
      const { x, y, width, height } = state.delta.getRect();
      // No drawing beyond the canvas
      if (x > canvasWidth || y > canvasHeight || x + width < 0 || y + height < 0) {
        return void 0;
      }
      this.ctx.save();
      state.delta.drawing(this.ctx);
      this.ctx.restore();
    });
  }

  public drawingEffect() {
    // TODO: 1. 超出画布不绘制 2. 仅绘制`change`部分(构造矩形)
  }

  public resetCtx() {
    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    this.ctx.scale(this.engine.devicePixelRatio, this.engine.devicePixelRatio);
  }

  public clear() {
    const { width, height } = this.engine.getRect();
    this.ctx.clearRect(0, 0, width, height);
  }
}
