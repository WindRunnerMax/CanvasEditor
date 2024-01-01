import type { Editor } from "../../editor";
import type { Range } from "../../selection/range";
import type { MouseEvent } from "./event";
import { Node } from "./node";

export class ElementNode extends Node {
  constructor(public readonly id: string, private editor: Editor, range: Range) {
    super(range);
  }

  protected onMouseDown = (e: MouseEvent) => {
    if (e.shiftKey) {
      this.editor.selection.addActiveDelta(this.id);
    } else {
      this.editor.selection.setActiveDelta(this.id);
    }
    this.editor.selection.compose();
  };

  protected onMouseEnter = () => {
    this.editor.canvas.mask.drawingState();
  };

  protected onMouseLeave = () => {
    this.editor.canvas.mask.drawingState();
  };
}
