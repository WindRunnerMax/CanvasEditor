import type { EventOptions } from "../types/event";

export class Event {
  public bubble: boolean;
  public capture: boolean;
  constructor(options?: EventOptions) {
    const { bubble = true, capture = false } = options || {};
    this.bubble = bubble;
    this.capture = capture;
  }

  public stop() {
    this.bubble = false;
  }
}
