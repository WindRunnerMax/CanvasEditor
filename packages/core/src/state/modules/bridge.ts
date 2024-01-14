import { Node } from "../../canvas/dom/node";
import { DeltaState } from "./node";

const NODE_TO_STATE = new WeakMap<Node, DeltaState>();
const STATE_TO_NODE = new WeakMap<DeltaState, Node>();

export class NSBridge {
  static set(state: DeltaState, node: Node) {
    NODE_TO_STATE.set(node, state);
    STATE_TO_NODE.set(state, node);
  }

  static get(node: null): null;
  static get(node: Node): DeltaState | null;
  static get(node: DeltaState): Node | null;
  static get(a: DeltaState | Node | null): Node | DeltaState | null {
    if (a === null) return null;
    if (a instanceof DeltaState) return STATE_TO_NODE.get(a) || null;
    if (a instanceof Node) NODE_TO_STATE.get(a) || null;
    return null;
  }
}
