import type { DeltaOptions } from "sketching-delta";
import { Delta } from "sketching-delta";

import { DEFAULT_BORDER_COLOR, DEFAULT_BORDER_WIDTH } from "../utils/constant";
import { RECT_ATTRS } from "./constant";

export class Rect extends Delta {
  public static KEY = "rect";
  public key = Rect.KEY;

  public drawing = (ctx: CanvasRenderingContext2D) => {
    const borderWidth = Number(this.getAttr(RECT_ATTRS.BORDER_WIDTH)) || DEFAULT_BORDER_WIDTH;
    const borderColor = this.getAttr(RECT_ATTRS.BORDER_COLOR) || DEFAULT_BORDER_COLOR;
    const fillColor = this.getAttr(RECT_ATTRS.FILL_COLOR);
    if (fillColor) {
      ctx.fillStyle = fillColor;
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    ctx.lineWidth = borderWidth;
    ctx.strokeStyle = borderColor;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
  };

  public static create = (options: DeltaOptions) => new Rect(options);
}
