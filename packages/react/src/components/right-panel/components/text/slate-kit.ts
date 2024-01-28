import type { BlockElement } from "doc-editor-light";
import {
  FONT_BASE_KEY,
  HYPER_LINK_KEY,
  INLINE_CODE_KEY,
  ORDERED_LIST_ITEM_KEY,
  STRIKE_THROUGH_KEY,
  UNDERLINE_KEY,
  UNORDERED_LIST_ITEM_KEY,
} from "doc-editor-light";
import type { Attributes, RichTextLine, RichTextLines } from "sketching-plugin";
import { TEXT_ATTRS } from "sketching-plugin";
import { TRUE } from "sketching-plugin";
import { GRAY_2, isArray, isEmptyValue } from "sketching-utils";
import { BLUE_6 } from "sketching-utils";

import { COLOR_PEER } from "./constant";

export const isBlock = (block: BlockElement) => {
  return isArray(block.children);
};

export const isText = (block: BlockElement) => {
  return !isBlock(block) && !isEmptyValue(block.text);
};

export const isTextBlock = (block: BlockElement) => {
  if (isBlock(block)) {
    return block.children.every(isText);
  }
};

export const pickAttrs = (block: BlockElement): BlockElement => {
  const copy = { ...block };
  // @ts-expect-error unknown
  delete copy.children;
  delete copy.text;
  return copy;
};

export const blocksToLines = (blocks: BlockElement[]) => {
  const lines: RichTextLines = [];
  const dfs = (blocks: BlockElement[]) => {
    for (const block of blocks) {
      if (isTextBlock(block)) {
        const lineAttrs: Attributes = {};
        // 需要处理行格式标识 -> Attributes
        if (block[UNORDERED_LIST_ITEM_KEY]) {
          const base = block[UNORDERED_LIST_ITEM_KEY];
          lineAttrs[TEXT_ATTRS.ORDERED_LIST_LEVEL] = base.level.toString();
        }
        if (block[ORDERED_LIST_ITEM_KEY]) {
          const base = block[ORDERED_LIST_ITEM_KEY];
          lineAttrs[TEXT_ATTRS.ORDERED_LIST_LEVEL] = base.level.toString();
          lineAttrs[TEXT_ATTRS.ORDERED_LIST_START] = base.start.toString();
        }
        const line: RichTextLine = { chars: [], config: lineAttrs };
        for (const text of block.children) {
          if (!isText(text)) continue;
          const attrs = pickAttrs(text);
          const target: Record<string, string> = {};
          // 需要处理行内格式标识 -> Attributes
          if (attrs.bold) target[TEXT_ATTRS.WEIGHT] = "bold";
          if (attrs.italic) target[TEXT_ATTRS.STYLE] = "italic";
          if (attrs[UNDERLINE_KEY]) target[TEXT_ATTRS.UNDERLINE] = TRUE;
          if (attrs[STRIKE_THROUGH_KEY]) target[TEXT_ATTRS.STRIKE_THROUGH] = TRUE;
          if (attrs[INLINE_CODE_KEY]) target[TEXT_ATTRS.BACKGROUND] = GRAY_2;
          if (attrs[HYPER_LINK_KEY]) {
            // @ts-expect-error unknown
            const href = attrs[HYPER_LINK_KEY].href;
            href && (target[TEXT_ATTRS.LINK] = href);
            target[TEXT_ATTRS.COLOR] = BLUE_6;
          }
          if (attrs[FONT_BASE_KEY]) {
            const base = attrs[FONT_BASE_KEY];
            // @ts-expect-error unknown
            const color = base.color;
            color && (target[TEXT_ATTRS.COLOR] = COLOR_PEER[color]);
            // @ts-expect-error unknown
            const background = base.background;
            background && (target[TEXT_ATTRS.BACKGROUND] = COLOR_PEER[background]);
            // @ts-expect-error unknown
            const fontSize = base.fontSize;
            fontSize && (target[TEXT_ATTRS.SIZE] = fontSize);
          }
          for (const char of text.text) {
            line.chars.push({ char, config: { ...target } });
          }
        }
        lines.push(line);
      } else {
        block.children && dfs(block.children);
      }
    }
  };
  dfs(blocks);
  return lines;
};
