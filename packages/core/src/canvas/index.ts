import ResizeObserver from "resize-observer-polyfill";
import { throttle } from "sketching-utils";

import type { Editor } from "../editor";
import { EDITOR_EVENT } from "../event/bus/action";
import { Range } from "../selection/modules/range";
import { Graph } from "./paint/graph";
import { Mask } from "./paint/mask";
import { Grab } from "./state/grab";
import { Insert } from "./state/insert";
import { Root } from "./state/root";
import { THE_CONFIG } from "./utils/constant";

export class Canvas {
  private width: number;
  private height: number;
  private offsetX: number;
  private offsetY: number;
  public readonly root: Root;
  public readonly grab: Grab;
  public readonly mask: Mask;
  public readonly graph: Graph;
  public readonly insert: Insert;
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
    this.devicePixelRatio = Math.ceil(window.devicePixelRatio || 1);
    this.resizeObserver = new ResizeObserver(this.onResize);
    this.grab = new Grab(this.editor, this);
    this.insert = new Insert(this.editor, this);
  }

  public onMount() {
    const dom = this.editor.getContainer();
    // COMPAT: 不存在则`draggable`元素会导致白屏
    dom.style.position = "relative";
    this.resizeObserver.observe(dom);
    this.width = dom.clientWidth;
    this.height = dom.clientHeight;
    this.graph.onMount(dom);
    this.mask.onMount(dom);
    this.editor.event.trigger(EDITOR_EVENT.MOUNT, {});
  }

  public destroy() {
    const dom = this.editor.getContainer();
    this.resizeObserver.unobserve(dom);
    this.root.destroy();
    this.mask.destroy(dom);
    this.graph.destroy(dom);
    this.grab.destroy();
    this.insert.destroy();
  }

  public reset() {
    const { width, height, offsetX, offsetY } = this.getRect();
    const range = Range.from(offsetX, offsetY, offsetX + width, offsetY + height);
    this.root.setRange(range);
    this.mask.reset();
    this.graph.reset();
    this.editor.event.trigger(EDITOR_EVENT.CANVAS_RESET, { range, offsetX, offsetY });
  }

  private onResizeBasic = (entries: ResizeObserverEntry[]) => {
    // COMPAT: `onResize`会触发首次`render`
    const [entry] = entries;
    if (!entry) return void 0;
    // 置宏任务队列
    setTimeout(() => {
      const { width, height } = entry.contentRect;
      this.width = width;
      this.height = height;
      this.reset();
      this.editor.event.trigger(EDITOR_EVENT.RESIZE, { width, height });
    }, 0);
  };
  private onResize = throttle(this.onResizeBasic, ...THE_CONFIG);

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

  public isOutside(range: Range) {
    const { offsetX, offsetY, width, height } = this.getRect();
    // 完全超出视口的区域不绘制
    const rect = range.rect();
    if (rect.x + rect.width < offsetX) return true;
    if (rect.y + rect.height < offsetY) return true;
    if (rect.x > offsetX + width) return true;
    if (rect.y > offsetY + height) return true;
    return false;
  }

  public isActive() {
    return this.mask.isActive() || this.graph.isActive();
  }

  /**
   * 判断是否默认模式
   * @description 根据状态判断拖拽、插入状态
   */
  public isDefaultMode() {
    return !this.grab.on && !this.insert.on;
  }
}
