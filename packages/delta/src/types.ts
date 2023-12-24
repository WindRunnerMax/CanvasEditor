import type { Delta } from "./delta";

export type DeltaLike = {
  x: number;
  y: number;
  id?: string;
  key: string;
  width: number;
  height: number;
  children?: string[];
  attrs?: Record<string, string>;
};
export type DeltaOptions = DeltaLike;
export type DeltaSetLike = Record<string, DeltaLike>;
export type DeltaSetOptions = DeltaSetLike;
export type StrictDeltaLike = Required<DeltaLike>;
export type StrictDeltaSetLike = Record<string, StrictDeltaLike>;

export enum OpType {
  INSERT,
  MOVE,
  RESIZE,
  REVISE,
  DELETE,
}
export type Op =
  | { type: OpType.INSERT; delta: Delta; id?: string }
  | { type: OpType.DELETE }
  | { type: OpType.MOVE; x: number; y: number }
  | { type: OpType.RESIZE; width: number; height: number }
  | { type: OpType.REVISE; attrs: Record<string, string> };

export type DeltaStatic = typeof Delta & {
  KEY: string;
  create: (options: DeltaOptions) => Delta;
};
