import type { DeltaOptions } from "sketching-delta";
import { Delta } from "sketching-delta";

export class Rect extends Delta {
  public static KEY = "rect";
  public key = Rect.KEY;

  public drawing = (ctx: CanvasRenderingContext2D) => {
    const borderWidth = Number(this.getAttr("borderWidth")) || 1;
    const borderColor = this.getAttr("borderColor") || "#333";
    ctx.lineWidth = borderWidth;
    ctx.strokeStyle = borderColor;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
  };

  public static create = (options: DeltaOptions) => new Rect(options);
}
