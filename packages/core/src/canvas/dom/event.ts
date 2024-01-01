class Event {
  public bubble: boolean;
  constructor() {
    this.bubble = true;
  }

  public stop() {
    this.bubble = false;
  }
}

export class MouseEvent extends Event {
  public readonly x: number;
  public readonly y: number;
  public readonly metaKey: boolean;
  public readonly ctrlKey: boolean;
  public readonly shiftKey: boolean;
  public readonly altKey: boolean;
  constructor(event: globalThis.MouseEvent) {
    super();
    this.x = event.offsetX;
    this.y = event.offsetY;
    this.metaKey = event.metaKey;
    this.ctrlKey = event.ctrlKey;
    this.shiftKey = event.shiftKey;
    this.altKey = event.altKey;
  }
}
