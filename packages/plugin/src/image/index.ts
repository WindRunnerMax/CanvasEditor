import type { DeltaOptions } from "sketching-delta";
import { Delta } from "sketching-delta";

import { EMPTY, IMAGE_ATTRS } from "./constant";

export class Image extends Delta {
  public static KEY = "image";
  public key = Image.KEY;
  private image: HTMLImageElement;

  public constructor(options: DeltaOptions) {
    super(options);
    this.image = new globalThis.Image(this.width, this.height);
    this.image.src = this.getAttr(IMAGE_ATTRS.SRC) || EMPTY;
  }

  setRect(x: number, y: number, width: number, height: number, z: number = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.width = width;
    this.height = height;
    this.image.width = width;
    this.image.height = height;
    return this;
  }

  public drawing = (ctx: CanvasRenderingContext2D) => {
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
  };

  public setAttr(key: string, value: string | null): this {
    super.setAttr(key, value);
    if (key === IMAGE_ATTRS.SRC) this.image.src = value || EMPTY;
    return this;
  }

  public static create = (options: DeltaOptions) => new Image(options);
}
