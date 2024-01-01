import { DeltaSet } from "sketching-delta";
import { ROOT_DELTA } from "sketching-utils";

import { Canvas } from "../canvas";
import { Event } from "../event";
import { LOG_LEVEL, Logger } from "../log";
import { Selection } from "../selection";
import { EditorState } from "../state";
import { EDITOR_STATE } from "../state/utils/constant";
import { EntryDelta } from "./delta/entry";
import { DEFAULT_DELTA_LIKE, DEFAULT_DELTA_SET_LIKE } from "./utils/constant";
export type EditorOptions = {
  deltaSet?: DeltaSet;
  logLevel?: typeof LOG_LEVEL[keyof typeof LOG_LEVEL];
};

export class Editor {
  public readonly deltaSet: DeltaSet;
  public readonly state: EditorState;
  public readonly event: Event;
  public readonly logger: Logger;
  public readonly canvas: Canvas;
  public readonly selection: Selection;
  private container: HTMLDivElement;

  constructor(options: EditorOptions = {}) {
    const { deltaSet = new DeltaSet(DEFAULT_DELTA_SET_LIKE), logLevel = LOG_LEVEL.ERROR } = options;
    this.deltaSet = deltaSet;
    // Verify DeltaSet Rules
    if (!this.deltaSet.get(ROOT_DELTA)) {
      this.deltaSet.add(new EntryDelta(DEFAULT_DELTA_LIKE));
    }
    this.container = document.createElement("div");
    this.container.setAttribute("data-type", "mock");
    // Modules
    this.event = new Event(this);
    this.state = new EditorState(this, this.deltaSet);
    this.logger = new Logger(logLevel);
    this.selection = new Selection(this);
    this.canvas = new Canvas(this);
  }

  public onMount(container: HTMLDivElement) {
    if (this.state.get(EDITOR_STATE.MOUNTED)) {
      console.warn("Editor has been mounted, please destroy it before mount again.");
    }
    this.container = container;
    this.state.set(EDITOR_STATE.MOUNTED, true);
    this.canvas.onMount();
    this.event.bind();
  }

  public destroy() {
    this.event.unbind();
    this.canvas.destroy();
    this.selection.destroy();
    this.state.set(EDITOR_STATE.MOUNTED, false);
  }

  public getContainer() {
    return this.container;
  }
}
