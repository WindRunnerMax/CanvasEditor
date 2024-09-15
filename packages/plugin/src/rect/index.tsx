import type { DeltaOptions } from "sketching-delta";
import { Delta } from "sketching-delta";

import { DEFAULT_BORDER_COLOR, DEFAULT_BORDER_WIDTH, TRULY } from "../utils/constant";
import { isTruly } from "../utils/is";
import { RECT_ATTRS } from "./constant";

export class Rect extends Delta {
  public static KEY = "rect";
  public key = Rect.KEY;

  constructor(options: DeltaOptions) {
    super(options);
  }

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
      const L = this.getAttr(RECT_ATTRS.L);
      const R = this.getAttr(RECT_ATTRS.R);
      const T = this.getAttr(RECT_ATTRS.T);
      const B = this.getAttr(RECT_ATTRS.B);
      const width = Math.min(this.width, this.height, borderWidth);
      ctx.fillStyle = borderColor;
      if (isTruly(L)) {
        ctx.fillRect(this.x, this.y, width, this.height);
      }
      if (isTruly(R)) {
        ctx.fillRect(this.x + this.width - width, this.y, width, this.height);
      }
      if (isTruly(T)) {
        ctx.fillRect(this.x, this.y, this.width, width);
      }
      if (isTruly(B)) {
        ctx.fillRect(this.x, this.y + this.height - width, this.width, width);
      }
    }
    ctx.restore();
  };

  public static create = (options: DeltaOptions) => {
    const rect = new Rect(options);
    // 默认创建时创建边框标记
    const L = rect.getAttr(RECT_ATTRS.L);
    const R = rect.getAttr(RECT_ATTRS.R);
    const T = rect.getAttr(RECT_ATTRS.T);
    const B = rect.getAttr(RECT_ATTRS.B);
    if (!L && !R && !T && !B) {
      rect.setAttr(RECT_ATTRS.L, TRULY);
      rect.setAttr(RECT_ATTRS.R, TRULY);
      rect.setAttr(RECT_ATTRS.T, TRULY);
      rect.setAttr(RECT_ATTRS.B, TRULY);
    }
    return rect;
  };
}
