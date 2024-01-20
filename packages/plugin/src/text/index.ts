import type { DeltaOptions } from "sketching-delta";
import { Delta } from "sketching-delta";

import { RichText } from "./rich-text";

const text = new RichText();

export class Text extends Delta {
  public static KEY = "text";
  public key = Text.KEY;

  public drawing = (ctx: CanvasRenderingContext2D) => {
    const plain = "请输入内容...";
    const line = plain.split("").map(char => ({ char, config: {} }));
    const matrices = text.parse([line], this.width);
    text.render(matrices, ctx, this.x, this.y, this.width, this.height);
  };

  public static create = (options: DeltaOptions) => new Text(options);
}
