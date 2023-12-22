export type DeltaLike = {
  x: number;
  y: number;
  width: number;
  height: number;
  attrs: unknown;
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
export type Op<T = unknown> =
  | WithId<{ type: OpType.INSERT | OpType.DELETE }>
  | WithId<{ type: OpType.MOVE; x: number; y: number }>
  | WithId<{ type: OpType.RESIZE; width: number; height: number }>
  | WithId<{ type: OpType.REVISE; attrs: T }>;
