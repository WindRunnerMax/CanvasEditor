import type { Editor } from "../editor";
import type { Canvas } from "./index";

export class Mask {
  private canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;

  constructor(private editor: Editor, private parent: Canvas) {
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
  }

  public onMount(dom: HTMLDivElement, ratio: number) {
    const { width, height } = this.parent.getRect();
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

  public resetCtx() {
    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    this.ctx.scale(this.parent.devicePixelRatio, this.parent.devicePixelRatio);
  }
}
