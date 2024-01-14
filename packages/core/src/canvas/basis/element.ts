import type { Editor } from "../../editor";
import type { Range } from "../../selection/modules/range";
import { EDITOR_STATE } from "../../state/utils/constant";
import { BLUE_3 } from "../utils/palette";
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
    if (this.editor.selection.has(this.id)) {
      return void 0;
    }
    this.editor.canvas.mask.drawingEffect(this.range);
  };

  protected onMouseLeave = () => {
    this.isHovering = false;
    if (!this.editor.selection.has(this.id)) {
      this.editor.canvas.mask.drawingEffect(this.range);
    }
  };

  public drawingMask = (ctx: CanvasRenderingContext2D) => {
    if (
      this.isHovering &&
      !this.editor.selection.has(this.id) &&
      !this.editor.state.get(EDITOR_STATE.MOUSE_DOWN)
    ) {
      const { x, y, width, height } = this.range.rect();
      drawRect(ctx, {
        x: x,
        y: y,
        width: width,
        height: height,
        borderColor: BLUE_3,
        borderWidth: 1,
      });
    }
  };
}
