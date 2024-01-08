import ResizeObserver from "resize-observer-polyfill";
import { throttle } from "sketching-utils";

import type { Editor } from "../editor";
import { EDITOR_EVENT } from "../event/bus/action";
import { Range } from "../selection/range";
import { Graph } from "./draw/graph";
import { Mask } from "./draw/mask";
import { DragState } from "./state/drag";
import { Root } from "./state/root";
import { THE_CONFIG, THE_DELAY } from "./utils/constant";

export class Canvas {
  private width: number;
  private height: number;
  private offsetX: number;
  private offsetY: number;
  public readonly root: Root;
  public readonly mask: Mask;
  public readonly graph: Graph;
  public readonly dragState: DragState;
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
    this.dragState = new DragState(this.editor, this);
  }

  public onMount() {
    const dom = this.editor.getContainer();
    this.resizeObserver.observe(dom);
    this.width = dom.clientWidth;
    this.height = dom.clientHeight;
    this.graph.onMount(dom);
    this.mask.onMount(dom);
    this.reset();
    this.editor.event.on(EDITOR_EVENT.MOUSE_WHEEL, this.onTranslate);
  }

  public destroy() {
    const dom = this.editor.getContainer();
    this.resizeObserver.unobserve(dom);
    this.root.destroy();
    this.mask.destroy(dom);
    this.graph.destroy(dom);
    this.editor.event.off(EDITOR_EVENT.MOUSE_WHEEL, this.onTranslate);
  }

  private reset() {
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

  private onTranslate = (e: WheelEvent) => {
    e.preventDefault();
    const { deltaX, deltaY } = e;
    this.translate(deltaX, deltaY);
  };

  public translateImmediately = (x: number, y: number) => {
    this.offsetX = this.offsetX + x;
    this.offsetY = this.offsetY + y;
    this.reset();
  };
  public translate = throttle(this.translateImmediately, THE_DELAY, THE_CONFIG);

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
