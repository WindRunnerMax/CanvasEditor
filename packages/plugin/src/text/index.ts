import type { BlockElement } from "doc-editor-light";
import type { DeltaOptions } from "sketching-delta";
import { Delta } from "sketching-delta";
import { TSON } from "sketching-utils";

import type { RichTextLines } from "./constant";
import { TEXT_ATTRS } from "./constant";
import { RichText } from "./rich-text";

const text = new RichText();

export class Text extends Delta {
  public static KEY = "text";
  public key = Text.KEY;

  public drawing = (ctx: CanvasRenderingContext2D) => {
    const lines: RichTextLines = [];
    const data = this.getAttr(TEXT_ATTRS.DATA);
    const blocks = data && TSON.parse<BlockElement[]>(data);
    if (!data || !blocks) {
      const plain = "选中以编辑...";
      const line = plain.split("").map(char => ({ char, config: {} }));
      lines.push({ chars: line, config: {} });
    }
    const matrices = text.parse(lines, this.width);
    text.render(matrices, ctx, this.x, this.y, this.width, this.height);
  };

  public static create = (options: DeltaOptions) => new Text(options);
}
