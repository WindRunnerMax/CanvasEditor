import type { Editor } from "../../editor";
import { Range } from "../../selection/range";
import { EDITOR_STATE } from "../../state/utils/constant";
import type { ResizeType } from "../utils/constant";
import { RESIZE_LEN, RESIZE_OFS, RESIZE_TYPE } from "../utils/constant";
import { DEEP_GRAY, GRAY, WHITE } from "../utils/palette";
import { drawArc, drawRect } from "../utils/shape";
import { Node } from "./node";

export class ResizeNode extends Node {
  private type: ResizeType;

  constructor(private editor: Editor, type: ResizeType, parent: Node) {
    super(Range.from(0, 0));
    this.type = type;
    this.setParent(parent);
  }

  public setRange = (range: Range) => {
    const { startX, startY, endX, endY } = range.flat();
    let target = Range.from(0, 0);
    switch (this.type) {
      case RESIZE_TYPE.LT: {
        const range = Range.from(startX, startY, startX + RESIZE_LEN, startY + RESIZE_LEN);
        target = range.move(-RESIZE_OFS, -RESIZE_OFS);
        break;
      }
      case RESIZE_TYPE.RT: {
        const range = Range.from(endX, startY, endX + RESIZE_LEN, startY + RESIZE_LEN);
        target = range.move(-RESIZE_OFS, -RESIZE_OFS);
        break;
      }
      case RESIZE_TYPE.LB: {
        const range = Range.from(startX, endY, startX + RESIZE_LEN, endY + RESIZE_LEN);
        target = range.move(-RESIZE_OFS, -RESIZE_OFS);
        break;
      }
      case RESIZE_TYPE.RB: {
        const range = Range.from(endX, endY, endX + RESIZE_LEN, endY + RESIZE_LEN);
        target = range.move(-RESIZE_OFS, -RESIZE_OFS);
        break;
      }
      case RESIZE_TYPE.L: {
        const range = Range.from(startX, startY, startX, endY);
        const { x, y } = range.center();
        const offset = RESIZE_OFS / 2;
        target = Range.from(x - offset, y - RESIZE_OFS, x + offset, y + RESIZE_OFS);
        break;
      }
      case RESIZE_TYPE.R: {
        const range = Range.from(endX, startY, endX, endY);
        const { x, y } = range.center();
        const offset = RESIZE_OFS / 2;
        target = Range.from(x - offset, y - RESIZE_OFS, x + offset, y + RESIZE_OFS);
        break;
      }
      case RESIZE_TYPE.T: {
        const range = Range.from(startX, startY, endX, startY);
        const { x, y } = range.center();
        const offset = RESIZE_OFS / 2;
        target = Range.from(x - RESIZE_OFS, y - offset, x + RESIZE_OFS, y + offset);
        break;
      }
      case RESIZE_TYPE.B: {
        const range = Range.from(startX, endY, endX, endY);
        const { x, y } = range.center();
        const offset = RESIZE_OFS / 2;
        target = Range.from(x - RESIZE_OFS, y - offset, x + RESIZE_OFS, y + offset);
        break;
      }
    }
    super.setRange(target);
  };

  protected onMouseEnter = () => {
    if (!this.editor.selection.get()) return void 0;
    this.editor.canvas.mask.setCursorState(this.type);
  };

  protected onMouseLeave = () => {
    if (this.editor.state.get(EDITOR_STATE.MOUSE_DOWN)) return void 0;
    this.editor.canvas.mask.setCursorState(null);
  };

  public drawingMask = (ctx: CanvasRenderingContext2D) => {
    if (!this.editor.selection.get()) return void 0;
    const range = this.range;
    const { x, y } = range.center();
    const fillColor = WHITE;
    const borderWidth = 1;
    const radius = RESIZE_LEN / 2;
    switch (this.type) {
      case RESIZE_TYPE.LB:
      case RESIZE_TYPE.LT:
      case RESIZE_TYPE.RB:
      case RESIZE_TYPE.RT:
        drawArc(ctx, { x, y, borderColor: DEEP_GRAY, fillColor, radius, borderWidth });
        break;
      case RESIZE_TYPE.B:
      case RESIZE_TYPE.R:
      case RESIZE_TYPE.T:
      case RESIZE_TYPE.L:
        drawRect(ctx, { ...range.rect(), fillColor, borderColor: GRAY, borderWidth });
        break;
    }
  };
}
