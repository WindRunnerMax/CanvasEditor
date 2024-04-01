import type { Delta } from "./delta";
import type { Op } from "./op";

export type DeltaLike = {
  x: number;
  y: number;
  z?: number;
  id?: string;
  key: string;
  width: number;
  height: number;
  children?: string[];
  attrs?: DeltaAttributes;
};

export type DeltaOptions = DeltaLike;
export type DeltaSetLike = Record<string, DeltaLike>;
export type DeltaSetOptions = DeltaSetLike;
export type DeltaAttributes = Record<string, string | null>;

export type StrictDeltaLike = Required<DeltaLike>;
export type StrictDeltaSetLike = Record<string, StrictDeltaLike>;
export type DeltaStatic = typeof Delta & {
  KEY: string;
  create: (options: DeltaOptions) => Delta;
};

export const OP_TYPE = {
  INSERT: "INSERT",
  MOVE: "MOVE",
  RESIZE: "RESIZE",
  REVISE: "REVISE",
  DELETE: "DELETE",
} as const;
export type OpType = keyof typeof OP_TYPE;

export type OpPayload = {
  [OP_TYPE.INSERT]: { delta: Delta; parentId: string };
  [OP_TYPE.DELETE]: { id: string; parentId: string };
  [OP_TYPE.MOVE]: { ids: string[]; x: number; y: number };
  [OP_TYPE.RESIZE]: { id: string; x: number; y: number; width: number; height: number };
  [OP_TYPE.REVISE]: { id: string; attrs: DeltaAttributes; z?: number };
};

export type OpRecord = { [K in OpType]: Op<K> };
export type OpSetType = OpRecord[OpType];
export type Ops = OpSetType[];
