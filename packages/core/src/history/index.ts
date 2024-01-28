import type { OpSetType } from "sketching-delta";

import type { Editor } from "../editor";
import { EDITOR_EVENT } from "../event/bus/action";
import type { ContentChangeEvent } from "../event/bus/types";

export class History {
  private readonly DELAY = 500;
  private readonly STACK_SIZE = 100;
  private temp: OpSetType[];
  private undoStack: OpSetType[][];
  private redoStack: OpSetType[][];
  protected timer: ReturnType<typeof setTimeout> | null;

  constructor(private editor: Editor) {
    this.temp = [];
    this.timer = null;
    this.redoStack = [];
    this.undoStack = [];
    this.editor.event.on(EDITOR_EVENT.CONTENT_CHANGE, this.onContentChange);
  }

  destroy() {
    this.editor.event.off(EDITOR_EVENT.CONTENT_CHANGE, this.onContentChange);
  }

  private collectImmediately = () => {
    if (!this.temp.length) return void 0;
    this.undoStack.push(this.temp);
    this.temp = [];
    this.redoStack = [];
    this.timer = null;
    if (this.undoStack.length > this.STACK_SIZE) this.undoStack.shift();
  };

  private onContentChange = (e: ContentChangeEvent) => {
    if (!e.options.undoable) return void 0;
    const { previous, changes } = e;
    const inverts = changes
      .map(change => change.op)
      .map(change => change.invert(previous))
      .filter(Boolean) as OpSetType[];
    this.temp.push(...inverts);
    this.timer = setTimeout(this.collectImmediately, this.DELAY);
  };

  public undo() {
    this.collectImmediately();
    if (!this.undoStack.length) return void 0;
    const ops = this.undoStack.pop();
    if (!ops) return void 0;
    this.editor.canvas.mask.clearWithOp();
    this.redoStack.push(ops);
    this.editor.logger.debug("UNDO", ops);
    ops.forEach(op => this.editor.state.apply(op, { source: "undo", undoable: false }));
  }

  public redo() {
    if (!this.redoStack.length) return void 0;
    const ops = this.redoStack.pop();
    if (!ops) return void 0;
    this.editor.canvas.mask.clearWithOp();
    this.undoStack.push(ops);
    this.editor.logger.debug("REDO", ops);
    ops.forEach(op => this.editor.state.apply(op, { source: "redo", undoable: false }));
  }
}
