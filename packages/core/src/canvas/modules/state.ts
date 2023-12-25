import type { Editor } from "../../editor";
import { EDITOR_EVENT } from "../../event/bus/action";
import type { SelectionStateEvent } from "../../event/bus/types";
import type { CANVAS_STATE, SelectionState } from "../utils/constant";

export class CanvasStateStore {
  private state: SelectionState;
  constructor(protected editor: Editor) {
    this.state = {};
  }

  public setState<T extends CANVAS_STATE>(key: T, value: SelectionState[T]) {
    this.state[key] = value;
    const action: SelectionStateEvent = { type: key as number, payload: value };
    this.editor.event.trigger(EDITOR_EVENT.CANVAS_STATE, action);
    return this;
  }

  public getState<T extends CANVAS_STATE>(key: T): SelectionState[T] {
    return this.state[key];
  }

  public resetState() {
    this.state = {};
    return this;
  }
}
