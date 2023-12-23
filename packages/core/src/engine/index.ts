import type { Editor } from "../editor";

export class Engine {
  private mask: HTMLCanvasElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private ctxMask: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private devicePixelRatio: number;

  constructor(private editor: Editor) {
    this.mask = document.createElement("canvas");
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    this.ctxMask = this.mask.getContext("2d") as CanvasRenderingContext2D;
    this.width = 0;
    this.height = 0;
    this.devicePixelRatio = window.devicePixelRatio || 1;
  }

  public onMount() {
    const dom = this.editor.getContainer();
    this.width = dom.clientWidth;
    this.height = dom.clientHeight;
    dom.style.position = "relative";
    this.mask.width = this.canvas.width = this.width * this.devicePixelRatio;
    this.mask.height = this.canvas.height = this.height * this.devicePixelRatio;
    this.mask.style.width = this.canvas.style.width = this.width + "px";
    this.mask.style.height = this.canvas.style.height = this.height + "px";
    this.mask.style.position = this.canvas.style.position = "absolute";
    dom.appendChild(this.canvas);
    dom.appendChild(this.mask);
    Promise.resolve().then(() => this.drawingAll());
  }

  public onResize = () => {
    // TODO: onResize Callback
  };

  public drawingAll() {
    // TODO: 1. 超出画布不绘制 2. 仅绘制`change`部分(构造矩形)
    this.editor.deltaSet.forEach((_, delta) => {
      this.ctx.reset();
      this.ctx.scale(this.devicePixelRatio, this.devicePixelRatio);
      delta.drawing(this.ctx);
    });
  }

  destroy() {
    const dom = this.editor.getContainer();
    dom.removeChild(this.canvas);
    dom.removeChild(this.mask);
  }
}
