import type { AttributeMap, InsertOp } from "@block-kit/delta";
import { Delta, isEOLOp } from "@block-kit/delta";
import {
  BACKGROUND_KEY,
  BOLD_KEY,
  BULLET_LIST_TYPE,
  DIVIDER_KEY,
  FONT_COLOR_KEY,
  FONT_SIZE_KEY,
  INDENT_LEVEL_KEY,
  INLINE_CODE_KEY,
  ITALIC_KEY,
  LINE_HEIGHT_KEY,
  LINK_KEY,
  LIST_START_KEY,
  LIST_TYPE_KEY,
  ORDER_LIST_TYPE,
  STRIKE_KEY,
  UNDERLINE_KEY,
} from "@block-kit/plugin";
import type { Attributes, RichTextLine, RichTextLines } from "sketching-plugin";
import { TEXT_ATTRS, TRULY } from "sketching-plugin";
import { BLUE_6, GRAY_2 } from "sketching-utils";

import { getDefaultTextDelta } from "./constant";

export const sketchToTextDelta = (lines: RichTextLines): Delta => {
  const delta = new Delta();
  for (const line of lines) {
    for (const item of line.chars) {
      const { char, config } = item;
      const attrs: AttributeMap = {};
      if (config[TEXT_ATTRS.WEIGHT] === "bold") {
        attrs[BOLD_KEY] = TRULY;
      }
      if (config[TEXT_ATTRS.STYLE] === "italic") {
        attrs[ITALIC_KEY] = TRULY;
      }
      if (config[TEXT_ATTRS.UNDERLINE]) {
        attrs[UNDERLINE_KEY] = TRULY;
      }
      if (config[TEXT_ATTRS.STRIKE_THROUGH]) {
        attrs[STRIKE_KEY] = TRULY;
      }
      if (config[TEXT_ATTRS.BACKGROUND] === GRAY_2) {
        attrs[INLINE_CODE_KEY] = TRULY;
      }
      if (config[TEXT_ATTRS.LINK]) {
        attrs[LINK_KEY] = config[TEXT_ATTRS.LINK];
      }
      if (
        config[TEXT_ATTRS.COLOR] &&
        config[TEXT_ATTRS.COLOR] !== GRAY_2 &&
        config[TEXT_ATTRS.COLOR] !== BLUE_6
      ) {
        attrs[FONT_COLOR_KEY] = config[TEXT_ATTRS.COLOR];
      }
      if (config[TEXT_ATTRS.BACKGROUND]) {
        attrs[BACKGROUND_KEY] = config[TEXT_ATTRS.BACKGROUND];
      }
      if (config[TEXT_ATTRS.SIZE]) {
        attrs[FONT_SIZE_KEY] = config[TEXT_ATTRS.SIZE];
      }
      const op = { insert: char, attributes: attrs } as InsertOp;
      delta.push(op);
    }
    const lineAttrs: AttributeMap = {};
    if (line.config[TEXT_ATTRS.DIVIDING_LINE]) {
      delta.insert(" ", { [DIVIDER_KEY]: TRULY });
    }
    if (line.config[TEXT_ATTRS.UNORDERED_LIST_LEVEL]) {
      const level = Number(line.config[TEXT_ATTRS.UNORDERED_LIST_LEVEL]);
      level > 1 && (lineAttrs[INDENT_LEVEL_KEY] = String(level - 1));
      lineAttrs[LIST_TYPE_KEY] = BULLET_LIST_TYPE;
    }
    if (line.config[TEXT_ATTRS.ORDERED_LIST_LEVEL]) {
      const level = Number(line.config[TEXT_ATTRS.ORDERED_LIST_LEVEL]);
      level > 1 && (lineAttrs[INDENT_LEVEL_KEY] = String(level - 1));
      const start = line.config[TEXT_ATTRS.ORDERED_LIST_START];
      lineAttrs[LIST_START_KEY] = start;
      lineAttrs[LIST_TYPE_KEY] = ORDER_LIST_TYPE;
    }
    if (line.config[TEXT_ATTRS.LINE_HEIGHT]) {
      lineAttrs[LINE_HEIGHT_KEY] = line.config[TEXT_ATTRS.LINE_HEIGHT];
    }
    delta.insertEOL(lineAttrs);
  }
  if (!delta.ops.length) {
    return getDefaultTextDelta();
  }
  return delta;
};

export const textDeltaToSketch = (delta: Delta): RichTextLines => {
  const lines: RichTextLines = [];
  delta.eachLine((lineDelta, lineDeltaAttrs) => {
    const lineAttrs: AttributeMap = {};
    if (lineDeltaAttrs[LIST_TYPE_KEY] === BULLET_LIST_TYPE) {
      const level = lineDeltaAttrs[INDENT_LEVEL_KEY]
        ? Number(lineDeltaAttrs[INDENT_LEVEL_KEY]) + 1
        : 1;
      lineAttrs[TEXT_ATTRS.UNORDERED_LIST_LEVEL] = level.toString();
    }
    if (lineDeltaAttrs[LIST_TYPE_KEY] === ORDER_LIST_TYPE) {
      const level = lineDeltaAttrs[INDENT_LEVEL_KEY]
        ? Number(lineDeltaAttrs[INDENT_LEVEL_KEY]) + 1
        : 1;
      const start = lineDeltaAttrs[LIST_START_KEY] ? Number(lineDeltaAttrs[LIST_START_KEY]) : 1;
      lineAttrs[TEXT_ATTRS.ORDERED_LIST_LEVEL] = level.toString();
      lineAttrs[TEXT_ATTRS.ORDERED_LIST_START] = start.toString();
    }
    if (lineDeltaAttrs[LINE_HEIGHT_KEY]) {
      lineAttrs[TEXT_ATTRS.LINE_HEIGHT] = lineDeltaAttrs[LINE_HEIGHT_KEY].toString();
    }
    const firstOp = lineDelta.ops[0];
    if (firstOp && firstOp.attributes && firstOp.attributes[DIVIDER_KEY]) {
      lineAttrs[TEXT_ATTRS.DIVIDING_LINE] = TRULY;
      lines.push({ chars: [], config: lineAttrs });
      return void 0;
    }
    const line: RichTextLine = { chars: [], config: lineAttrs };
    lineDelta.forEach(op => {
      if (isEOLOp(op)) {
        return void 0;
      }
      const opAttrs = op.attributes || {};
      const target: Attributes = {};
      if (opAttrs[BOLD_KEY]) {
        target[TEXT_ATTRS.WEIGHT] = "bold";
      }
      if (opAttrs[ITALIC_KEY]) {
        target[TEXT_ATTRS.STYLE] = "italic";
      }
      if (opAttrs[UNDERLINE_KEY]) {
        target[TEXT_ATTRS.UNDERLINE] = TRULY;
      }
      if (opAttrs[STRIKE_KEY]) {
        target[TEXT_ATTRS.STRIKE_THROUGH] = TRULY;
      }
      if (opAttrs[INLINE_CODE_KEY]) {
        target[TEXT_ATTRS.BACKGROUND] = GRAY_2;
      }
      if (opAttrs[LINK_KEY]) {
        const href = opAttrs[LINK_KEY];
        href && (target[TEXT_ATTRS.LINK] = href);
        target[TEXT_ATTRS.COLOR] = BLUE_6;
      }
      if (opAttrs[FONT_COLOR_KEY]) {
        target[TEXT_ATTRS.COLOR] = opAttrs[FONT_COLOR_KEY];
      }
      if (opAttrs[BACKGROUND_KEY]) {
        target[TEXT_ATTRS.BACKGROUND] = opAttrs[BACKGROUND_KEY];
      }
      if (opAttrs[FONT_SIZE_KEY]) {
        target[TEXT_ATTRS.SIZE] = opAttrs[FONT_SIZE_KEY];
      }
      line.chars.push({ char: op.insert!, config: target });
    });
    lines.push(line);
  });
  return lines;
};
