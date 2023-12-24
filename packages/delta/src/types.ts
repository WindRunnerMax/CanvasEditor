import type { Delta } from "./delta";
import type { Op } from "./op";

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
export type DeltaStatic = typeof Delta & {
  KEY: string;
  create: (options: DeltaOptions) => Delta;
};

export enum OpType {
  INSERT,
  MOVE,
  RESIZE,
  REVISE,
  DELETE,
}
export type OpPayload = {
  [OpType.INSERT]: { delta: Delta; id?: string };
  [OpType.DELETE]: { id?: string };
  [OpType.MOVE]: { x: number; y: number };
  [OpType.RESIZE]: { width: number; height: number };
  [OpType.REVISE]: { attrs: Record<string, string> };
};
export type OpRecord = {
  [K in OpType]: Op<K>;
};
export type Ops = OpRecord[OpType];
