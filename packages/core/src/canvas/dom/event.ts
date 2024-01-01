type EventOptions = { bubble?: boolean; capture?: boolean };

class Event {
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

export class MouseEvent extends Event {
  public readonly x: number;
  public readonly y: number;
  public readonly metaKey: boolean;
  public readonly ctrlKey: boolean;
  public readonly shiftKey: boolean;
  public readonly altKey: boolean;

  constructor(
    event: globalThis.MouseEvent,
    // 默认不捕获 默认不冒泡
    options: EventOptions = { bubble: false, capture: false }
  ) {
    super(options);
    this.x = event.offsetX;
    this.y = event.offsetY;
    this.metaKey = event.metaKey;
    this.ctrlKey = event.ctrlKey;
    this.shiftKey = event.shiftKey;
    this.altKey = event.altKey;
  }
}
