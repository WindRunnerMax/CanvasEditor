import { TEXT_1 } from "sketching-utils";

export const TEXT_ATTRS = {
  // 基准数据
  DATA: "DATA",
  ORIGIN_DATA: "ORIGIN_DATA",
  // 行标识
  LINE_HEIGHT: "LINE_HEIGHT",
  ORDERED_LIST_LEVEL: "ORDERED_LIST_LEVEL",
  ORDERED_LIST_START: "ORDERED_LIST_START",
  UNORDERED_LIST_LEVEL: "UNORDERED_LIST_LEVEL",
  DIVIDING_LINE: "DIVIDING_LINE",
  BREAK_LINE_START: "BREAK_LINE_START",
  // 文字标识
  SIZE: "SIZE",
  LINK: "LINK",
  STYLE: "STYLE",
  COLOR: "COLOR",
  FAMILY: "FAMILY",
  WEIGHT: "WEIGHT",
  UNDERLINE: "UNDERLINE",
  BACKGROUND: "BACKGROUND",
  STRIKE_THROUGH: "STRIKE_THROUGH",
} as const;

export const DEFAULT = {
  [TEXT_ATTRS.FAMILY]:
    "Inter,-apple-system,BlinkMacSystemFont,PingFang SC,Hiragino Sans GB,noto sans,Microsoft YaHei,Helvetica Neue,Helvetica,Arial,sans-serif",
  [TEXT_ATTRS.SIZE]: 14,
  [TEXT_ATTRS.WEIGHT]: "normal",
  [TEXT_ATTRS.STYLE]: "normal",
  [TEXT_ATTRS.COLOR]: TEXT_1,
  [TEXT_ATTRS.LINE_HEIGHT]: 1.5,
} as const;

export const BACKGROUND_OFFSET = 2;
export const DIVIDING_LINE_OFFSET = 6;
