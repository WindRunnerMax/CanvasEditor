import type { EditorSuite } from "doc-editor-core";
import type { BaseNode, BlockElement, Node, TextElement } from "doc-editor-delta";
import {
  DIVIDING_LINE_KEY,
  FONT_BASE_KEY,
  HYPER_LINK_KEY,
  INLINE_CODE_KEY,
  LINE_HEIGHT_KEY,
  ORDERED_LIST_ITEM_KEY,
  STRIKE_THROUGH_KEY,
  UNDERLINE_KEY,
  UNORDERED_LIST_ITEM_KEY,
} from "doc-editor-plugin";
import { isText, isTextBlock } from "doc-editor-utils";
import type { Attributes, RichTextLine, RichTextLines } from "sketching-plugin";
import { TEXT_ATTRS } from "sketching-plugin";
import { TRULY } from "sketching-plugin";
import { GRAY_2 } from "sketching-utils";
import { BLUE_6 } from "sketching-utils";

import { COLOR_PEER } from "./config/constant";

export const pickAttrs = (block: TextElement): TextElement => {
  const copy = { ...block };
  delete copy.children;
  // @ts-expect-error unknown
  delete copy.text;
  return copy;
};

export const isTextBlockAssert = (editor: EditorSuite, node: Node): node is BlockElement => {
  return isTextBlock(editor, node);
};

export const blocksToLines = (editor: EditorSuite, blocks: BaseNode[]) => {
  const lines: RichTextLines = [];
  const dfs = (blocks: BaseNode[]) => {
    for (const block of blocks) {
      if (isTextBlock(editor, block)) {
        const current = block as BlockElement;
        const lineAttrs: Attributes = {};
        // 需要处理行格式标识 -> Attributes
        if (current[UNORDERED_LIST_ITEM_KEY]) {
          const base = current[UNORDERED_LIST_ITEM_KEY];
          lineAttrs[TEXT_ATTRS.UNORDERED_LIST_LEVEL] = base.level.toString();
        }
        if (current[ORDERED_LIST_ITEM_KEY]) {
          const base = current[ORDERED_LIST_ITEM_KEY];
          lineAttrs[TEXT_ATTRS.ORDERED_LIST_LEVEL] = base.level.toString();
          lineAttrs[TEXT_ATTRS.ORDERED_LIST_START] = base.start.toString();
        }
        if (current[LINE_HEIGHT_KEY]) {
          lineAttrs[TEXT_ATTRS.LINE_HEIGHT] = current[LINE_HEIGHT_KEY].toString();
        }
        if (current[DIVIDING_LINE_KEY]) {
          lineAttrs[TEXT_ATTRS.DIVIDING_LINE] = TRULY;
        }
        const line: RichTextLine = { chars: [], config: lineAttrs };
        for (const text of current.children) {
          if (!isText(text)) continue;
          const attrs = pickAttrs(text);
          const target: Record<string, string> = {};
          // 需要处理行内格式标识 -> Attributes
          if (attrs.bold) target[TEXT_ATTRS.WEIGHT] = "bold";
          if (attrs.italic) target[TEXT_ATTRS.STYLE] = "italic";
          if (attrs[UNDERLINE_KEY]) target[TEXT_ATTRS.UNDERLINE] = TRULY;
          if (attrs[STRIKE_THROUGH_KEY]) target[TEXT_ATTRS.STRIKE_THROUGH] = TRULY;
          if (attrs[INLINE_CODE_KEY]) target[TEXT_ATTRS.BACKGROUND] = GRAY_2;
          if (attrs[HYPER_LINK_KEY]) {
            const href = attrs[HYPER_LINK_KEY].href;
            href && (target[TEXT_ATTRS.LINK] = href);
            target[TEXT_ATTRS.COLOR] = BLUE_6;
          }
          if (attrs[FONT_BASE_KEY]) {
            const base = attrs[FONT_BASE_KEY];
            const color = base.color;
            color && (target[TEXT_ATTRS.COLOR] = COLOR_PEER[color]);
            const background = base.background;
            background && (target[TEXT_ATTRS.BACKGROUND] = COLOR_PEER[background]);
            const fontSize = base.fontSize;
            fontSize && (target[TEXT_ATTRS.SIZE] = fontSize.toString());
          }
          for (const char of text.text) {
            line.chars.push({ char, config: { ...target } });
          }
        }
        lines.push(line);
      } else {
        block.children && dfs(block.children as BlockElement[]);
      }
    }
  };
  dfs(blocks);
  return lines;
};
