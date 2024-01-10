import { DEFAULT_PRIORITY } from "sketching-utils";

import type { EventMap, EventMapKeys } from "./action";

type Listener<T extends EventMapKeys> = (value: EventMap[T]) => void;
type Handler<T extends EventMapKeys> = {
  once: boolean;
  priority: number;
  listener: Listener<T>;
};
type Listeners = {
  [T in EventMapKeys]?: Handler<T>[];
};

export class EventBus {
  private listeners: Listeners = {};

  public on<T extends EventMapKeys>(key: T, listener: Listener<T>, priority = DEFAULT_PRIORITY) {
    this.addEventListener(key, listener, priority, false);
  }

  public once<T extends EventMapKeys>(key: T, listener: Listener<T>, priority = DEFAULT_PRIORITY) {
    this.addEventListener(key, listener, priority, true);
  }

  private addEventListener<T extends EventMapKeys>(
    key: T,
    listener: Listener<T>,
    priority: number,
    once: boolean
  ) {
    const handler: Handler<T>[] = this.listeners[key] || [];
    !handler.some(item => item.listener === listener) && handler.push({ listener, priority, once });
    handler.sort((a, b) => a.priority - b.priority);
    (this.listeners[key] as Handler<T>[]) = handler;
  }

  public off<T extends EventMapKeys>(key: T, listener: Listener<T>) {
    const handler = this.listeners[key];
    if (!handler) return void 0;
    // COMPAT: 不能直接`splice` 可能会导致`trigger`时打断`forEach`
    const next = handler.filter(item => item.listener !== listener);
    (this.listeners[key] as Handler<T>[]) = next;
  }

  public trigger<T extends EventMapKeys>(key: T, value: EventMap[T]) {
    const handler = this.listeners[key];
    if (!handler) return void 0;
    handler.forEach(item => {
      item.listener(value);
      item.once && this.off(key, item.listener);
    });
  }

  public clear() {
    this.listeners = {};
  }
}
