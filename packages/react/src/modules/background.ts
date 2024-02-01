import type { CanvasResetEvent, Editor, RangeRect } from "sketching-core";
import { EDITOR_EVENT, Range } from "sketching-core";

import { A4, DPI, PAGE_OFFSET } from "../utils/constant";

export class Background {
  public static range: Range;
  public static rect: RangeRect;
  private static canvas: HTMLCanvasElement;
  private static ctx: CanvasRenderingContext2D;

  public static init(editor: Editor) {
    const dom = editor.getContainer();
    dom.style.position = "relative";
    Background.canvas = document.createElement("canvas");
    Background.ctx = Background.canvas.getContext("2d") as CanvasRenderingContext2D;
    Background.canvas.style.background = "var(--color-fill-3)";
    Background.canvas.style.position = "absolute";
    Background.canvas.style.zIndex = "-1";
    Background.setRect(dom.offsetWidth, dom.offsetHeight);
    if (!Background.range) {
      const opWidthPX = (A4.width * DPI) / 25.4;
      const opHeightPX = (A4.height * DPI) / 25.4;
      const range = Range.fromRect(PAGE_OFFSET.x, PAGE_OFFSET.y, opWidthPX, opHeightPX);
      Background.setRange(range);
    }
    dom.insertBefore(Background.canvas, dom.firstChild);
    editor.event.on(EDITOR_EVENT.CANVAS_RESET, Background.onReset);
  }

  public static setRect(width: number, height: number) {
    const ctx = Background.ctx;
    const canvas = Background.canvas;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.scale(ratio, ratio);
  }

  public static setRange(range: Range) {
    const prevRect = range.rect();
    const next = Range.fromRect(
      prevRect.x,
      prevRect.y,
      Math.ceil(prevRect.width),
      Math.ceil(prevRect.height)
    );
    Background.range = next;
    Background.rect = next.rect();
  }

  public static render() {
    const ctx = Background.ctx;
    const space = Background.range;
    const width = this.canvas.width;
    const height = this.canvas.height;
    ctx.clearRect(0, 0, width, height);
    const rect = space.rect();
    ctx.fillStyle = "#fff";
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
  }

  private static onReset(e: CanvasResetEvent) {
    const { range, offsetX, offsetY } = e;
    if (!range) return void 0;
    const ctx = Background.ctx;
    const { height, width } = range.rect();
    Background.setRect(width, height);
    ctx.translate(-offsetX, -offsetY);
    Background.render();
  }

  public static destroy(editor: Editor) {
    const dom = editor.getContainer();
    dom.removeChild(Background.canvas);
    editor.event.off(EDITOR_EVENT.CANVAS_RESET, Background.onReset);
  }
}
