import type { DeltaOptions } from "sketching-delta";
import { Delta } from "sketching-delta";
import { TSON } from "sketching-utils";

import { TEXT_ATTRS } from "./constant";
import { RichText } from "./rich-text";
import type { RichTextLines } from "./types";

const text = new RichText();

export class Text extends Delta {
  public static KEY = "text";
  public key = Text.KEY;

  public drawing = (ctx: CanvasRenderingContext2D) => {
    const lines: RichTextLines = [];
    const data = this.getAttr(TEXT_ATTRS.DATA);
    const blocks = data && TSON.parse<RichTextLines>(data);
    if (!data || !blocks) {
      const plain = "选中以编辑...";
      const line = plain.split("").map(char => ({ char, config: {} }));
      lines.push({ chars: line, config: {} });
    } else {
      lines.push(...blocks);
    }
    const matrices = text.parse(lines, this.width);
    text.render(matrices, ctx, this.x, this.y, this.width, this.height);
  };

  public static create = (options: DeltaOptions) => new Text(options);
}
