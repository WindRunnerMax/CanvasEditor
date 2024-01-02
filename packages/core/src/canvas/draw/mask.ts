import { isEmptyValue } from "sketching-utils";

import type { Editor } from "../../editor";
import type { Range } from "../../selection/range";
import type { Node } from "../dom/node";
import type { Canvas } from "../index";
import type { ResizeType } from "../utils/constant";
import { CURSOR_STATE } from "../utils/constant";
import { isRangeIntersect } from "../utils/is";

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

  // ====== Drawing On Demand ======
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
    return effects;
  }

  public drawingRange(range: Range) {
    // COMPAT: 选区范围未能完全覆盖
    const current = range.zoom(1);
    // 增量绘制`range`范围内的节点
    const effects = this.collectEffects(current);
    const { x, y, width, height } = current.rect();
    // 只绘制受影响的节点并且裁剪多余位置
    this.clear(current);
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.rect(x, y, width, height);
    this.ctx.clip();
    effects.forEach(node => node.drawingMask?.(this.ctx));
    this.ctx.closePath();
    this.ctx.restore();
  }

  // ====== Cursor State ======
  public setCursorState(type: ResizeType | null) {
    this.canvas.style.cursor = isEmptyValue(type) ? "" : CURSOR_STATE[type];
    return this;
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
