import type { BlockElement } from "doc-editor-light";
import { FONT_BASE_KEY, HYPER_LINK_KEY, STRIKE_THROUGH_KEY, UNDERLINE_KEY } from "doc-editor-light";
import { isArray, isEmptyValue } from "sketching-utils";

import { BLUE_6 } from "../../../utils/src/palette";
import { TRUE } from "../utils/constant";
import type { RichTextLine, RichTextLines } from "./constant";
import { COLOR_PEER, TEXT_ATTRS } from "./constant";

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
        const line: RichTextLine = {
          chars: [],
          config: pickAttrs(block) as Record<string, string>,
        };
        for (const text of block.children) {
          if (!isText(text)) continue;
          const attrs = pickAttrs(text);
          const target: Record<string, string> = {};
          // 需要处理行内格式标识 -> Record<string, string>
          if (attrs.bold) target[TEXT_ATTRS.WEIGHT] = "bold";
          if (attrs.italic) target[TEXT_ATTRS.STYLE] = "italic";
          if (attrs[UNDERLINE_KEY]) target[TEXT_ATTRS.UNDERLINE] = TRUE;
          if (attrs[STRIKE_THROUGH_KEY]) target[TEXT_ATTRS.STRIKE_THROUGH] = TRUE;
          if (attrs[FONT_BASE_KEY]) {
            // @ts-expect-error unknown
            const color = attrs[FONT_BASE_KEY].color;
            color && (target[TEXT_ATTRS.COLOR] = COLOR_PEER[color]);
            // @ts-expect-error unknown
            const background = attrs[FONT_BASE_KEY].background;
            background && (target[TEXT_ATTRS.BACKGROUND] = COLOR_PEER[background]);
            // @ts-expect-error unknown
            const fontSize = attrs[FONT_BASE_KEY].fontSize;
            fontSize && (target[TEXT_ATTRS.SIZE] = fontSize);
          }
          if (attrs[HYPER_LINK_KEY]) {
            // @ts-expect-error unknown
            const href = attrs[HYPER_LINK_KEY].href;
            href && (target[TEXT_ATTRS.LINK] = href);
            target[TEXT_ATTRS.COLOR] = BLUE_6;
          }
          for (const char of text.text) {
            line.chars.push({ char, config: target });
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
