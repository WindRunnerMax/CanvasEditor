import type { DeltaState } from "../../state/node/state";
import type { Node } from "../basis/node";

export const NODE_TO_DELTA = new WeakMap<Node, DeltaState>();
export const DELTA_TO_NODE = new WeakMap<DeltaState, Node>();
