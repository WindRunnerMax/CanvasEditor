import { isEmptyValue } from "sketching-utils";

import type { Editor } from "../../editor";
import { Range } from "../../selection/modules/range";
import { EDITOR_STATE } from "../../state/utils/constant";
import type { Node } from "../dom/node";
import type { Canvas } from "../index";
import type { DrawingEffectOptions } from "../types/paint";
import { CURSOR_STATE } from "../utils/constant";

export class Mask {
  private range: Range | null;
  private effects: Set<Node> | null;
  private canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  private timer: ReturnType<typeof setTimeout> | null;

  constructor(private editor: Editor, private engine: Canvas) {
    // `Mask`绘制的是`Node`
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    this.timer = null;
    this.range = null;
    this.effects = null;
  }

  public onMount(dom: HTMLDivElement) {
    this.canvas.tabIndex = -1;
    dom.appendChild(this.canvas);
  }

  public destroy(dom: HTMLDivElement) {
    dom.removeChild(this.canvas);
  }

  // ====== Drawing On Demand ======
  private collectEffects(range: Range) {
    // 判定`range`范围内影响的节点
    const effects = new Set<Node>();
    const nodes: Node[] = this.engine.root.getFlatNode(false);
    // 渲染顺序和事件调用顺序相反
    for (let i = nodes.length - 1; i >= 0; i--) {
      const node = nodes[i];
      // 需要排除`root`否则必然导致全量重绘
      if (node === this.engine.root) continue;
      if (!this.editor.canvas.isOutside(node.range) && range.intersect(node.range)) {
        effects.add(node);
      }
    }
    return effects;
  }

  private drawing(effects: Set<Node>, range: Range) {
    // 只读状态下不进行绘制
    if (this.editor.state.get(EDITOR_STATE.READONLY)) return void 0;
    const { x, y, width, height } = range.rect();
    // 只绘制受影响的节点并且裁剪多余位置
    this.clear(range);
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.rect(x, y, width, height);
    this.ctx.clip();
    effects.forEach(node => node.drawingMask?.(this.ctx));
    this.ctx.closePath();
    this.ctx.restore();
  }

  private batchDrawing(effects: Set<Node>, range: Range) {
    // COMPAT: 防止瞬时多次绘制时闪动
    this.range = this.range ? this.range.compose(range) : range;
    this.effects = new Set([...(this.effects || []), ...effects]);
    if (!this.timer) {
      this.timer = setTimeout(() => {
        const currentRange = this.range || range;
        const currentEffects = this.effects || effects;
        this.editor.logger.debug("Mask Effects", currentEffects);
        this.drawing(currentEffects, currentRange);
        this.timer = null;
        this.range = null;
        this.effects = null;
      }, 16.7);
    }
  }

  public drawingEffect(range: Range, options?: DrawingEffectOptions) {
    const { immediately = false, force = false } = options || {};
    // 非默认模式下不需要绘制`Mask`
    if (!force && !this.engine.isDefaultMode()) return void 0;
    // COMPAT: 选区范围未能完全覆盖
    const current = range.zoom(this.editor.canvas.devicePixelRatio);
    // 增量绘制`range`范围内的节点
    const effects = this.collectEffects(current);
    immediately ? this.drawing(effects, current) : this.batchDrawing(effects, current);
  }

  // ====== State ======
  public setCursorState(type: keyof typeof CURSOR_STATE | null) {
    this.canvas.style.cursor = isEmptyValue(type) ? "" : CURSOR_STATE[type];
    return this;
  }

  public focus() {
    this.canvas.focus();
  }

  public isActive() {
    return this.canvas === document.activeElement;
  }

  // ====== Canvas Actions ======
  public reset() {
    this.clear();
    const { width, height } = this.engine.getRect();
    const ratio = this.engine.devicePixelRatio;
    this.canvas.width = width * ratio;
    this.canvas.height = height * ratio;
    this.canvas.style.width = width + "px";
    this.canvas.style.height = height + "px";
    this.canvas.style.position = "absolute";
    this.resetCtx();
  }

  public resetCtx() {
    const { offsetX, offsetY, width, height } = this.engine.getRect();
    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    this.ctx.scale(this.engine.devicePixelRatio, this.engine.devicePixelRatio);
    this.ctx.translate(-offsetX, -offsetY);
    Promise.resolve().then(() => {
      // `Range.from`是具体坐标点
      const range = Range.from(offsetX, offsetY, width + offsetX, height + offsetY);
      // COMPAT: 需要立即绘制 否则在`wheel`事件中会闪动
      this.drawingEffect(range, { immediately: true });
    });
  }

  public clearWithOp() {
    this.clear();
    this.editor.selection.clearActiveDeltas();
  }

  public clear(range?: Range) {
    if (range) {
      const { x, y, width, height } = range.rect();
      this.ctx.clearRect(x, y, width, height);
    } else {
      const { width, height, offsetX, offsetY } = this.engine.getRect();
      this.ctx.clearRect(offsetX, offsetY, width, height);
    }
  }
}
