import type { Editor } from "../editor";

export class Engine {
  private mask: HTMLCanvasElement;
  private canvas: HTMLCanvasElement;
  constructor(private editor: Editor) {
    this.mask = document.createElement("canvas");
    this.canvas = document.createElement("canvas");
  }

  public onMount() {
    const dom = this.editor.getContainer();
    const width = dom.clientWidth;
    const height = dom.clientHeight;
    dom.style.position = "relative";
    this.mask.width = this.canvas.width = width;
    this.mask.height = this.canvas.height = height;
    this.mask.style.position = this.canvas.style.position = "absolute";
    dom.appendChild(this.canvas);
    dom.appendChild(this.mask);
  }

  public onResize = () => {
    // TODO: onResize Callback
  };

  destroy() {
    const dom = this.editor.getContainer();
    dom.removeChild(this.canvas);
    dom.removeChild(this.mask);
  }
}
