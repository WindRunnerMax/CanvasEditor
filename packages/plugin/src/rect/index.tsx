import type { DeltaOptions } from "sketching-delta";
import { Delta } from "sketching-delta";

export class Rect extends Delta {
  public static KEY = "rect";
  public key = Rect.KEY;

  public drawing = (ctx: CanvasRenderingContext2D) => {
    console.log("ctx", this.id, ctx);
  };

  public static create = (options: DeltaOptions) => new Rect(options);
}
