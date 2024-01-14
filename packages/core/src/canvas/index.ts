import ResizeObserver from "resize-observer-polyfill";

import type { Editor } from "../editor";
import { EDITOR_EVENT } from "../event/bus/action";
import { Range } from "../selection/modules/range";
import { Graph } from "./paint/graph";
import { Mask } from "./paint/mask";
import { Grab } from "./state/grab";
import { Root } from "./state/root";

export class Canvas {
  private width: number;
  private height: number;
  private offsetX: number;
  private offsetY: number;
  public readonly root: Root;
  public readonly grab: Grab;
  public readonly mask: Mask;
  public readonly graph: Graph;
  private resizeObserver: ResizeObserver;
  public readonly devicePixelRatio: number;

  constructor(protected editor: Editor) {
    this.width = 0;
    this.height = 0;
    this.offsetX = 0;
    this.offsetY = 0;
    this.root = new Root(editor, this);
    this.mask = new Mask(editor, this);
    this.graph = new Graph(editor, this);
    this.devicePixelRatio = window.devicePixelRatio || 1;
    this.resizeObserver = new ResizeObserver(this.onResize);
    this.grab = new Grab(this.editor, this);
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
    this.grab.destroy();
  }

  public reset() {
    this.mask.reset();
    this.graph.reset();
    const { width, height, offsetX, offsetY } = this.getRect();
    this.root.setRange(Range.from(offsetX, offsetY, offsetX + width, offsetY + height));
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

  public setOffset(x: number, y: number) {
    this.offsetX = x;
    this.offsetY = y;
  }

  public getRect() {
    return {
      offsetX: this.offsetX,
      offsetY: this.offsetY,
      width: this.width,
      height: this.height,
    };
  }

  public isOutside = (range: Range) => {
    const { offsetX, offsetY, width, height } = this.getRect();
    // 完全超出视口的区域不绘制
    const rect = range.rect();
    if (rect.x + rect.width < offsetX) return true;
    if (rect.y + rect.height < offsetY) return true;
    if (rect.x > offsetX + width) return true;
    if (rect.y > offsetY + height) return true;
    return false;
  };
}
