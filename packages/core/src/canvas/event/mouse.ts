import type { Editor } from "../../editor";
import type { EventOptions } from "../types/event";
import { Event } from "./basic";

export class MouseEvent extends Event {
  public readonly x: number;
  public readonly y: number;
  public readonly clientX: number;
  public readonly clientY: number;
  public readonly metaKey: boolean;
  public readonly ctrlKey: boolean;
  public readonly shiftKey: boolean;
  public readonly altKey: boolean;
  public readonly native: globalThis.MouseEvent;

  constructor(
    event: globalThis.MouseEvent,
    offsetX: number,
    offsetY: number,
    // 默认不捕获 默认不冒泡
    options: EventOptions = { bubble: false, capture: false }
  ) {
    super(options);
    this.x = event.offsetX + offsetX;
    this.y = event.offsetY + offsetY;
    this.metaKey = event.metaKey;
    this.ctrlKey = event.ctrlKey;
    this.shiftKey = event.shiftKey;
    this.altKey = event.altKey;
    this.native = event;
    this.clientX = event.clientX;
    this.clientY = event.clientY;
  }

  static from(event: globalThis.MouseEvent, editor: Editor) {
    const { offsetX, offsetY } = editor.canvas.getRect();
    return new MouseEvent(event, offsetX, offsetY);
  }
}
