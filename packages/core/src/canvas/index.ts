import ResizeObserver from "resize-observer-polyfill";

import type { Editor } from "../editor";
import { EDITOR_EVENT } from "../event/bus/action";
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
  private resizeObserver: ResizeObserver;

  constructor(protected editor: Editor) {
    this.width = 0;
    this.height = 0;
    this.root = new Root(editor);
    this.mask = new Mask(editor, this);
    this.graph = new Graph(editor, this);
    this.devicePixelRatio = window.devicePixelRatio || 1;
    this.resizeObserver = new ResizeObserver(this.onResize);
  }

  public onMount() {
    const dom = this.editor.getContainer();
    this.resizeObserver.observe(dom);
    this.width = dom.clientWidth;
    this.height = dom.clientHeight;
    this.graph.onMount(dom);
    this.mask.onMount(dom);
    this.reset();
  }

  public destroy() {
    const dom = this.editor.getContainer();
    this.resizeObserver.unobserve(dom);
    this.root.destroy();
    this.mask.destroy(dom);
    this.graph.destroy(dom);
  }

  private reset() {
    this.mask.reset();
    this.graph.reset();
    this.root.setRange(Range.from(this.width, this.height));
  }

  private onResize = (entries: ResizeObserverEntry[]) => {
    const [entry] = entries;
    if (!entry) return void 0;
    const { width, height } = entry.contentRect;
    this.editor.event.trigger(EDITOR_EVENT.RESIZE, { width, height });
    this.width = width;
    this.height = height;
    this.reset();
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
}
