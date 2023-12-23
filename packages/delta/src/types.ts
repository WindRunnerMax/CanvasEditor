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

export enum OpType {
  INSERT,
  MOVE,
  RESIZE,
  REVISE,
  DELETE,
}
type WithId<T> = T & { id: string };
export type Op =
  | { type: OpType.INSERT; delta: Delta; id?: string }
  | WithId<{ type: OpType.DELETE }>
  | WithId<{ type: OpType.MOVE; x: number; y: number }>
  | WithId<{ type: OpType.RESIZE; width: number; height: number }>
  | WithId<{ type: OpType.REVISE; attrs: Record<string, string> }>;

export type DeltaStatic = typeof Delta & {
  KEY: string;
  create: (options: DeltaOptions) => Delta;
};
