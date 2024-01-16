import type { DeltaSetLike } from "sketching-delta";

export const EXAMPLE: DeltaSetLike = {
  ROOT: {
    x: -999999,
    y: -999999,
    id: "ROOT",
    key: "entry",
    attrs: {},
    width: 0,
    height: 0,
    children: ["VSIZD4xTEt", "test"],
  },
  VSIZD4xTEt: {
    x: 300,
    y: 200,
    id: "VSIZD4xTEt",
    key: "rect",
    attrs: {},
    width: 100,
    height: 100,
    children: [],
  },
  test: {
    x: 600,
    y: 300,
    id: "test",
    key: "rect",
    attrs: {},
    width: 100,
    height: 100,
    children: [],
  },
};
