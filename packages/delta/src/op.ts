import type { OpPayload, OpType } from "./types";

export class Op<T extends OpType> {
  public readonly type: T;
  public readonly payload: OpPayload[T];
  constructor(type: T, payload: OpPayload[T]) {
    this.type = type;
    this.payload = payload;
  }

  static from<T extends OpType>(type: T, payload: OpPayload[T]) {
    return new Op(type, payload);
  }
}
