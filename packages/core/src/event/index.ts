import type { Editor } from "../editor";
import { EventBus } from "./bus";
import { NativeEvent } from "./native";

export class Event {
  private nativeEvent: NativeEvent;
  private bus: EventBus;

  constructor(private editor: Editor) {
    this.bus = new EventBus();
    this.nativeEvent = new NativeEvent(this.bus, this.editor);
  }

  bind() {
    return this.nativeEvent.bind();
  }

  unbind() {
    this.bus.clear();
    return this.nativeEvent.unbind();
  }

  on: EventBus["on"] = (key, listener, priority) => {
    return this.bus.on(key, listener, priority);
  };

  once: EventBus["once"] = (key, listener, priority) => {
    return this.bus.once(key, listener, priority);
  };

  off: EventBus["off"] = (key, listener) => {
    return this.bus.off(key, listener);
  };

  trigger: EventBus["trigger"] = (key, payload) => {
    return this.bus.trigger(key, payload);
  };
}
