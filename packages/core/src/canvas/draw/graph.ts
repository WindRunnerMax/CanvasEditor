import type { Editor } from "../../editor";
import { Range } from "../../selection/range";
import type { DeltaState } from "../../state/node/state";
import type { Canvas } from "../index";

export class Graph {
  private canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;

  constructor(private editor: Editor, private engine: Canvas) {
    // `Graph`绘制的是`State`
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

  public drawingAll() {
    this.clear();
    const { width, height } = this.engine.getRect();
    this.drawingEffect(Range.from(width, height));
  }

  private collectEffects(range: Range) {
    // 判定`range`范围内影响的节点
    const effects = new Set<DeltaState>();
    this.editor.state.getDeltas().forEach(state => {
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
    const { width: canvasWidth, height: canvasHeight } = this.engine.getRect();
    // 只绘制受影响的节点并且裁剪多余位置
    this.clear(current);
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.rect(x, y, width, height);
    this.ctx.clip();
    effects.forEach(state => {
      const { x, y, width, height } = state.toRange().rect();
      // TODO: 实现拖拽变换后的视口判断
      // 完全超出`Canvas`的区域不绘制
      if (x > canvasWidth || y > canvasHeight || x + width < 0 || y + height < 0) {
        return void 0;
      }
      this.ctx.save();
      state.toDelta().drawing(this.ctx);
      this.ctx.restore();
    });
    this.ctx.closePath();
    this.ctx.restore();
  }

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
