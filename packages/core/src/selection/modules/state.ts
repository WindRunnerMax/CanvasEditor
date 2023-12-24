import type { Editor } from "../../editor";
import { EDITOR_EVENT } from "../../event/bus/action";
import type { SelectionStateEvent } from "../../event/bus/types";
import type { SELECTION_STATE } from "../utils/constant";

export class SelectionState {
  private state: SelectionStateEvent;
  constructor(protected editor: Editor) {
    this.state = {};
  }

  public setState<T extends SELECTION_STATE>(key: T, value: SelectionStateEvent[T]) {
    this.state.type = key;
    this.state[key] = value;
    this.editor.event.trigger(EDITOR_EVENT.SELECTION_STATE, this.state);
    return this;
  }

  public getState<T extends SELECTION_STATE>(key: T): SelectionStateEvent[T] {
    return this.state[key];
  }

  public resetState() {
    this.state = {};
    return this;
  }
}
