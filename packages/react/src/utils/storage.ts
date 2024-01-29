import type { DeltaSetLike } from "sketching-delta";

export type LocalStorageData = {
  x: number;
  y: number;
  width: number;
  height: number;
  deltaSetLike: DeltaSetLike;
};

export const STORAGE_KEY = "__sketching-storage";
export const EXAMPLE: LocalStorageData = {
  x: 160,
  y: 30,
  width: 793.7007874015749,
  height: 1122.4818897637797,
  deltaSetLike: {
    ROOT: {
      x: -999999,
      y: -999999,
      z: 0,
      id: "ROOT",
      key: "entry",
      width: 0,
      height: 0,
      attrs: {},
      children: ["ltfRU5Rmpi", "MAhBg3wRaK"],
    },
    ltfRU5Rmpi: {
      x: 417.5,
      y: 387,
      z: 0,
      id: "ltfRU5Rmpi",
      key: "rect",
      width: 278,
      height: 14,
      attrs: {
        "L": "false",
        "R": "false",
        "T": "false",
        "B": "true",
        "border-color": "#020202B8",
      },
      children: [],
    },
    MAhBg3wRaK: {
      x: 460.5,
      y: 352,
      z: 0,
      id: "MAhBg3wRaK",
      key: "text",
      width: 192,
      height: 38,
      attrs: {
        DATA: '[{"chars":[{"char":"基","config":{"WEIGHT":"bold"}},{"char":"于","config":{"WEIGHT":"bold"}},{"char":"C","config":{"WEIGHT":"bold"}},{"char":"a","config":{"WEIGHT":"bold"}},{"char":"n","config":{"WEIGHT":"bold"}},{"char":"v","config":{"WEIGHT":"bold"}},{"char":"a","config":{"WEIGHT":"bold"}},{"char":"s","config":{"WEIGHT":"bold"}},{"char":"实","config":{"WEIGHT":"bold"}},{"char":"现","config":{"WEIGHT":"bold"}},{"char":"的","config":{"WEIGHT":"bold"}},{"char":"简","config":{"WEIGHT":"bold"}},{"char":"历","config":{"WEIGHT":"bold"}},{"char":"编","config":{"WEIGHT":"bold"}},{"char":"辑","config":{"WEIGHT":"bold"}},{"char":"器","config":{"WEIGHT":"bold"}}],"config":{}}]',
        ORIGIN_DATA: '[{"children":[{"text":"基于Canvas实现的简历编辑器","bold":true}]}]',
      },
      children: [],
    },
  },
};
