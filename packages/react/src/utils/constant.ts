import { Point } from "sketching-core";
import type { DeltaSetLike } from "sketching-delta";

// 暂时认为`DPI`为`96`
export const DPI = 96;
export const A4 = { width: 210, height: 297 };
export const PAGE_OFFSET = new Point(100, 30);
export const PLACEHOLDER_SIZE = 99999990;
export const TOP_PLACEHOLDER = "TOP";
export const LEFT_PLACEHOLDER = "LEFT";
export const RIGHT_PLACEHOLDER = "RIGHT";
export const BOTTOM_PLACEHOLDER = "BOTTOM";

export const EXAMPLE: DeltaSetLike = {
  ROOT: {
    x: -999999,
    y: -999999,
    id: "ROOT",
    key: "entry",
    attrs: {},
    width: 0,
    height: 0,
    children: ["VSIZD4xTEt", "test", "text"],
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
  text: {
    x: 300,
    y: 400,
    id: "text",
    key: "text",
    attrs: {},
    width: 100,
    height: 100,
    children: [],
  },
};
