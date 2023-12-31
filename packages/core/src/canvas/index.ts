import type { Editor } from "../editor";
import { Graph } from "./modules/draw/graph";
import { Mask } from "./modules/draw/mask";
import { CanvasStateStore } from "./modules/state/store";

export class Canvas extends CanvasStateStore {
  private width: number;
  private height: number;
  public readonly devicePixelRatio: number;
  public readonly mask: Mask;
  public readonly graph: Graph;

  constructor(protected editor: Editor) {
    super(editor);
    this.width = 0;
    this.height = 0;
    this.mask = new Mask(editor, this);
    this.graph = new Graph(editor, this);
    this.devicePixelRatio = window.devicePixelRatio || 1;
  }

  public onMount() {
    const dom = this.editor.getContainer();
    this.width = dom.clientWidth;
    this.height = dom.clientHeight;
    this.graph.onMount(dom, this.devicePixelRatio);
    this.mask.onMount(dom, this.devicePixelRatio);
    this.resetAllCtx();
    Promise.resolve().then(() => this.graph.drawingAll());
  }

  public destroy() {
    super.destroy();
    const dom = this.editor.getContainer();
    this.mask.destroy(dom);
    this.graph.destroy(dom);
  }

  public onResize = () => {
    // TODO: onResize Callback
  };

  public getRect() {
    return { width: this.width, height: this.height };
  }

  private resetAllCtx = () => {
    this.mask.resetCtx();
    this.graph.resetCtx();
  };
}
