import { DeltaSet } from "sketching-delta";
import { ROOT_DELTA } from "sketching-utils";

import { Canvas } from "../canvas";
import { Clipboard } from "../clipboard";
import { Event } from "../event";
import { History } from "../history/";
import { LOG_LEVEL, Logger } from "../log";
import { Selection } from "../selection";
import { EditorState } from "../state";
import { EDITOR_STATE } from "../state/utils/constant";
import { EntryDelta } from "./delta/entry";
import { DEFAULT_DELTA_LIKE, DEFAULT_DELTA_SET_LIKE } from "./utils/constant";
import type { EditorOptions } from "./utils/types";
export class Editor {
  public deltaSet: DeltaSet;
  public readonly state: EditorState;
  public readonly event: Event;
  public readonly logger: Logger;
  public readonly canvas: Canvas;
  public readonly selection: Selection;
  public readonly history: History;
  public readonly clipboard: Clipboard;
  private container: HTMLDivElement;

  constructor(options: EditorOptions = {}) {
    const {
      deltaSet = new DeltaSet(DEFAULT_DELTA_SET_LIKE),
      logLevel = LOG_LEVEL.ERROR,
      readonly = false,
    } = options;
    this.deltaSet = deltaSet;
    // Verify DeltaSet Rules
    if (!this.deltaSet.get(ROOT_DELTA)) {
      this.deltaSet.add(new EntryDelta(DEFAULT_DELTA_LIKE));
    }
    this.container = document.createElement("div");
    this.container.setAttribute("data-type", "mock");
    // Modules
    this.event = new Event(this);
    this.state = new EditorState(this);
    this.logger = new Logger(logLevel);
    this.selection = new Selection(this);
    this.canvas = new Canvas(this);
    this.history = new History(this);
    this.clipboard = new Clipboard(this);
    // Update status
    this.state.setReadOnly(readonly);
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
    this.state.destroy();
    this.history.destroy();
    this.clipboard.destroy();
  }

  public getContainer() {
    return this.container;
  }
}
