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
    ctx.save();
    if (fillColor) {
      const width = this.width - borderWidth;
      const height = this.height - borderWidth;
      if (width > 0 && height > 0) {
        ctx.fillStyle = fillColor;
        const half = borderWidth / 2;
        ctx.fillRect(this.x + half, this.y + half, width, height);
      }
    }
    if (borderColor) {
      const width = Math.min(this.width, this.height, borderWidth);
      ctx.lineWidth = width;
      ctx.strokeStyle = borderColor;
      const half = width / 2;
      ctx.strokeRect(this.x + half, this.y + half, this.width - width, this.height - width);
    }

    ctx.restore();
  };

  public static create = (options: DeltaOptions) => new Rect(options);
}
