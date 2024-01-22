import type { OpSetType } from "sketching-delta";

export type ApplyOptions = {
  source?: string;
  undoable?: boolean;
};

export type FlatOp = {
  id: string;
  op: OpSetType;
};
