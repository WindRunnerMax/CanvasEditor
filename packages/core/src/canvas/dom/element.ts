import type { Editor } from "../../editor";
import type { Range } from "../../selection/range";
import { LIGHT_BLUE } from "../utils/palette";
import { drawRect } from "../utils/shape";
import type { MouseEvent } from "./event";
import { Node } from "./node";

export class ElementNode extends Node {
  private isHovering: boolean;
  constructor(public readonly id: string, private editor: Editor, range: Range) {
    super(range);
    this.isHovering = false;
  }

  protected onMouseDown = (e: MouseEvent) => {
    if (e.shiftKey) {
      this.editor.selection.addActiveDelta(this.id);
    } else {
      this.editor.selection.setActiveDelta(this.id);
    }
  };

  protected onMouseEnter = () => {
    this.isHovering = true;
    if (!this.editor.selection.has(this.id)) {
      // TODO: 绘制区域似乎有点问题 需要`zoom(1)`
      this.editor.canvas.mask.drawingRange(this.range);
    }
  };

  protected onMouseLeave = () => {
    this.isHovering = false;
    if (!this.editor.selection.has(this.id)) {
      this.editor.canvas.mask.drawingRange(this.range);
    }
  };

  public drawingMask = (ctx: CanvasRenderingContext2D) => {
    if (this.editor.selection.has(this.id)) {
      //
    } else if (this.isHovering && !this.editor.selection.has(this.id)) {
      const { x, y, width, height } = this.range.rect();
      drawRect(ctx, {
        x: x,
        y: y,
        width: width,
        height: height,
        borderColor: LIGHT_BLUE,
        borderWidth: 1,
      });
    }
  };
}
