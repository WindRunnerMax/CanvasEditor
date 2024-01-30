import type { Editor } from "../../editor";
import { EDITOR_EVENT } from "../../event/bus/action";
import { Range } from "../../selection/modules/range";
import type { DeltaState } from "../../state/modules/node";
import type { Canvas } from "../index";

export class Graph {
  private canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;

  constructor(private editor: Editor, private engine: Canvas) {
    // `Graph`绘制的是`State`
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
  }

  public onMount(dom: HTMLDivElement) {
    this.canvas.tabIndex = -1;
    dom.appendChild(this.canvas);
  }

  public destroy(dom: HTMLDivElement) {
    dom.removeChild(this.canvas);
  }

  public drawingAll() {
    this.clear();
    const { width, height, offsetX, offsetY } = this.engine.getRect();
    this.drawingEffect(Range.from(offsetX, offsetY, offsetX + width, offsetY + height));
  }

  private collectEffects(range: Range) {
    // 判定`range`范围内影响的节点
    const effects = new Set<DeltaState>();
    this.editor.state.getDeltasMap().forEach(state => {
      if (range.intersect(state.toRange())) {
        effects.add(state);
      }
    });
    return effects;
  }

  public drawingEffect(range: Range) {
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
    effects.forEach(state => {
      // 画布范围外的元素不绘制 可通过交替绘制来优化交互
      if (this.engine.isOutside(state.toRange())) {
        return void 0;
      }
      this.ctx.save();
      state.drawing(this.ctx);
      this.ctx.restore();
    });
    this.ctx.closePath();
    this.ctx.restore();
    this.editor.event.trigger(EDITOR_EVENT.PAINT, {});
  }

  public isActive() {
    return this.canvas === document.activeElement;
  }

  public reset() {
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
    const { offsetX, offsetY } = this.engine.getRect();
    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    this.ctx.scale(this.engine.devicePixelRatio, this.engine.devicePixelRatio);
    this.ctx.translate(-offsetX, -offsetY);
    Promise.resolve().then(() => this.drawingAll());
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
