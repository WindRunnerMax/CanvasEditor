import type { DeltaSet } from "./delta-set";
import type { DeltaAttributes, OpPayload, OpType } from "./types";
import { OP_TYPE } from "./types";

export class Op<T extends OpType> {
  public readonly type: T;
  public readonly payload: OpPayload[T];
  constructor(type: T, payload: OpPayload[T]) {
    this.type = type;
    this.payload = payload;
  }

  public invert(prev: DeltaSet) {
    switch (this.type) {
      case OP_TYPE.INSERT: {
        const payload = this.payload as OpPayload[typeof OP_TYPE.INSERT];
        const { delta, parentId } = payload;
        return new Op(OP_TYPE.DELETE, { id: delta.id, parentId });
      }
      case OP_TYPE.DELETE: {
        const payload = this.payload as OpPayload[typeof OP_TYPE.DELETE];
        const { id, parentId } = payload;
        const delta = prev.get(id);
        if (!delta) return null;
        return new Op(OP_TYPE.INSERT, { delta, parentId });
      }
      case OP_TYPE.MOVE: {
        const payload = this.payload as OpPayload[typeof OP_TYPE.MOVE];
        const { x, y, ids } = payload;
        return new Op(OP_TYPE.MOVE, { ids, x: -x, y: -y });
      }
      case OP_TYPE.RESIZE: {
        const payload = this.payload as OpPayload[typeof OP_TYPE.RESIZE];
        const { id } = payload;
        const delta = prev.get(id);
        if (!delta) return null;
        const { x, y, width, height } = delta.getRect();
        return new Op(OP_TYPE.RESIZE, { id, x, y, width, height });
      }
      case OP_TYPE.REVISE: {
        const payload = this.payload as OpPayload[typeof OP_TYPE.REVISE];
        const { id, attrs } = payload;
        const delta = prev.get(id);
        if (!delta) return null;
        const z = delta.getZ();
        const prevAttrs: DeltaAttributes = {};
        for (const key of Object.keys(attrs)) {
          prevAttrs[key] = delta.getAttr(key);
        }
        return new Op(OP_TYPE.REVISE, { id, attrs: prevAttrs, z });
      }
      default:
        break;
    }
    return null;
  }

  static from<T extends OpType>(type: T, payload: OpPayload[T]) {
    return new Op(type, payload);
  }
}
