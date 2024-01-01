import { isEmptyValue } from "sketching-utils";

import type { Editor } from "../../editor";
import type { Range } from "../../selection/range";
import type { Node } from "../dom/node";
import type { Canvas } from "../index";
import { CANVAS_STATE, CURSOR_STATE, OP_LEN } from "../utils/constant";
import { isRangeIntersect } from "../utils/is";
import { BLUE, LIGHT_BLUE, WHITE } from "../utils/palette";
import { drawArc, drawRect } from "../utils/shape";

export class Mask {
  private canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;

  constructor(private editor: Editor, private engine: Canvas) {
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
  }

  public onMount(dom: HTMLDivElement, ratio: number) {
    const { width, height } = this.engine.getRect();
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

  // ====== Drawing Range ======
  private collectEffects(range: Range) {
    // 判定`range`范围内影响的节点
    const effects = new Set<Node>();
    const nodes: Node[] = this.engine.root.getFlatNode();
    for (const node of nodes) {
      // 需要排除`root`否则必然导致全量重绘
      if (node === this.engine.root) continue;
      if (isRangeIntersect(range, node.range)) {
        effects.add(node);
      }
    }
    let current = range;
    effects.forEach(node => {
      current = range.compose(node.range);
    });
    return { range: current, effects };
  }

  public drawingRange(range: Range) {
    // 增量绘制`range`范围内的节点
    const { effects, range: effectRange } = this.collectEffects(range);
    const { x, y, width, height } = effectRange.rect();
    // 只绘制受影响的节点并且裁剪多余位置
    this.clear(effectRange);
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.rect(x, y, width, height);
    this.ctx.clip();
    effects.forEach(node => node.drawingMask?.(this.ctx));
    this.ctx.closePath();
    this.ctx.restore();
  }

  // ====== Drawing Selection ======
  public drawingSelectionBox() {
    const selection = this.editor.selection.get();
    if (!selection) return void 0;
    const { startX, startY, endX, endY } = selection.flat();
    drawRect(this.ctx, {
      x: startX,
      y: startY,
      width: endX - startX,
      height: endY - startY,
      borderColor: BLUE,
      borderWidth: 1,
    });
    const arc = { borderColor: BLUE, fillColor: WHITE, radius: OP_LEN / 2, borderWidth: 2 };
    drawArc(this.ctx, { ...arc, x: startX, y: startY });
    drawArc(this.ctx, { ...arc, x: endX, y: startY });
    drawArc(this.ctx, { ...arc, x: startX, y: endY });
    drawArc(this.ctx, { ...arc, x: endX, y: endY });
  }

  public drawingHoverBox() {
    // 暂时依旧取`hover`的值 用来做全量绘制
    // TODO: 基于事件实现+`clip`仅绘制/取消副作用是可行的
    const hover = this.engine.root.hover;
    const active = this.editor.selection.getActiveDeltas();
    if (!hover || active.has(hover.id)) return void 0;
    const delta = this.editor.deltaSet.get(hover.id);
    if (!delta) return void 0;
    const { x, y, width, height } = delta.getRect();
    drawRect(this.ctx, {
      x: x,
      y: y,
      width: width,
      height: height,
      borderColor: LIGHT_BLUE,
      borderWidth: 1,
    });
  }

  public drawingTranslateBox() {
    const rect = this.engine.getState(CANVAS_STATE.RECT);
    if (!rect) return void 0;
    const { startX, startY, endX, endY } = rect.flat();
    drawRect(this.ctx, {
      x: startX,
      y: startY,
      width: endX - startX,
      height: endY - startY,
      borderColor: BLUE,
      borderWidth: 1,
    });
  }

  public drawingState() {
    this.clear();
    this.ctx.save();
    this.drawingHoverBox();
    this.drawingSelectionBox();
    this.drawingTranslateBox();
    this.ctx.restore();
  }

  // ====== Cursor State ======
  public setCursorState() {
    const state = this.engine.getState(CANVAS_STATE.RESIZE);
    this.canvas.style.cursor = isEmptyValue(state) ? "" : CURSOR_STATE[state];
    return this;
  }

  public getCursorState() {
    return this.canvas.style.cursor || null;
  }

  // ====== Canvas Actions ======
  public resetCtx() {
    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    this.ctx.scale(this.engine.devicePixelRatio, this.engine.devicePixelRatio);
  }

  public clear(range?: Range) {
    if (range) {
      const { x, y, width, height } = range.rect();
      this.ctx.clearRect(x, y, width, height);
    } else {
      const { width, height } = this.engine.getRect();
      this.ctx.clearRect(0, 0, width, height);
    }
  }
}
