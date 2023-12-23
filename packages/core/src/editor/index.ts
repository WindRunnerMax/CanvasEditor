import { DeltaSet } from "sketching-delta";
import { ROOT_DELTA } from "sketching-utils";

import { Engine } from "../engine";
import { Event } from "../event";
import { LOG_LEVEL, Logger } from "../log";
import { EditorState } from "../state";
import { EDITOR_STATE } from "../state/constant";
import { DEFAULT_DELTA_LIKE, DEFAULT_DELTA_SET_LIKE } from "./constant";
import { EntryDelta } from "./entry";

export type EditorOptions = {
  deltaSet?: DeltaSet;
  logLevel?: typeof LOG_LEVEL[keyof typeof LOG_LEVEL];
};

export class Editor {
  public readonly deltaSet: DeltaSet;
  public readonly state: EditorState;
  public readonly event: Event;
  public readonly logger: Logger;
  public readonly engine: Engine;
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
    this.state = new EditorState(this, this.deltaSet);
    this.event = new Event(this);
    this.logger = new Logger(logLevel);
    this.engine = new Engine(this);
  }

  public onMount(container: HTMLDivElement) {
    if (this.state.get(EDITOR_STATE.MOUNTED)) {
      console.warn("Editor has been mounted, please destroy it before mount again.");
    }
    this.container = container;
    this.state.set(EDITOR_STATE.MOUNTED, true);
    this.engine.onMount();
    this.event.bind();
  }

  public destroy() {
    this.event.unbind();
    this.engine.destroy();
    this.state.set(EDITOR_STATE.MOUNTED, false);
  }

  public getContainer() {
    return this.container;
  }
}
