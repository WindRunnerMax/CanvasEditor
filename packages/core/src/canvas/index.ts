import type { Editor } from "../editor";
import { Range } from "../selection/range";
import { Graph } from "./draw/graph";
import { Mask } from "./draw/mask";
import { Root } from "./state/root";

export class Canvas {
  private width: number;
  private height: number;
  public readonly devicePixelRatio: number;
  public readonly mask: Mask;
  public readonly graph: Graph;
  public readonly root: Root;

  constructor(protected editor: Editor) {
    this.width = 0;
    this.height = 0;
    this.root = new Root(editor);
    this.mask = new Mask(editor, this);
    this.graph = new Graph(editor, this);
    this.devicePixelRatio = window.devicePixelRatio || 1;
  }

  public onMount() {
    const dom = this.editor.getContainer();
    this.width = dom.clientWidth;
    this.height = dom.clientHeight;
    this.root.setRange(Range.from(this.width, this.height));
    this.graph.onMount(dom, this.devicePixelRatio);
    this.mask.onMount(dom, this.devicePixelRatio);
    this.resetAllCtx();
    Promise.resolve().then(() => this.graph.drawingAll());
  }

  public destroy() {
    const dom = this.editor.getContainer();
    this.root.destroy();
    this.mask.destroy(dom);
    this.graph.destroy(dom);
  }

  public resize = () => {
    // TODO: Resize Event Remount And Draw
  };

  public getRect() {
    return { width: this.width, height: this.height };
  }

  public isOutside = (range: Range) => {
    // TODO: 实现拖拽变换后的视口判断
    // 完全超出`Canvas`的区域不绘制
    const { x, y, width, height } = range.rect();
    if (x > this.width || y > this.height || x + width < 0 || y + height < 0) {
      return true;
    }
    return false;
  };

  private resetAllCtx = () => {
    this.mask.resetCtx();
    this.graph.resetCtx();
  };
}
