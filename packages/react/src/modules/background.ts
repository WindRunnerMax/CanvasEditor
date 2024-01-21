import type { CanvasResetEvent, Editor } from "sketching-core";
import { EDITOR_EVENT, Range } from "sketching-core";

import { A4, DPI, PAGE_OFFSET } from "../utils/constant";

export class Background {
  private static range: Range;
  private static canvas: HTMLCanvasElement;
  private static ctx: CanvasRenderingContext2D;

  public static init(editor: Editor, standard?: Range) {
    const dom = editor.getContainer();
    dom.style.position = "relative";
    Background.canvas = document.createElement("canvas");
    Background.ctx = Background.canvas.getContext("2d") as CanvasRenderingContext2D;
    Background.canvas.style.background = "var(--color-fill-3)";
    Background.canvas.style.position = "absolute";
    Background.canvas.style.zIndex = "-1";
    if (standard) {
      Background.range = standard;
    } else {
      const opWidthPX = (A4.width * DPI) / 25.4;
      const opHeightPX = (A4.height * DPI) / 25.4;
      const range = Range.fromRect(PAGE_OFFSET.x, PAGE_OFFSET.y, opWidthPX, opHeightPX);
      Background.range = range;
    }
    dom.insertBefore(Background.canvas, dom.firstChild);
    editor.event.on(EDITOR_EVENT.CANVAS_RESET, Background.onReset);
  }

  public static setRange(range: Range) {
    Background.range = range;
  }

  private static onReset(e: CanvasResetEvent) {
    const { range, offsetX, offsetY } = e;
    const canvas = Background.canvas;
    const ctx = Background.ctx;
    const space = Background.range;
    if (!range) return void 0;
    const { height, width } = range.rect();
    const ratio = window.devicePixelRatio || 1;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.scale(ratio, ratio);
    ctx.clearRect(0, 0, width, height);
    ctx.translate(-offsetX, -offsetY);
    const rect = space.rect();
    ctx.fillStyle = "#fff";
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
  }

  public static destroy(editor: Editor) {
    const dom = editor.getContainer();
    dom.removeChild(Background.canvas);
    editor.event.off(EDITOR_EVENT.CANVAS_RESET, Background.onReset);
  }
}
