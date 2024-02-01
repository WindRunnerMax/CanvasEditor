import type { RangeRect } from "sketching-core";
import type { DeltaSet } from "sketching-delta";
import type { RichTextLines } from "sketching-plugin";
import { DIVIDING_LINE_OFFSET, RichText, Text, TEXT_ATTRS } from "sketching-plugin";
import { TSON } from "sketching-utils";

import { Background } from "../../../modules/background";

const text = new RichText();

export const parseLinks = (deltas: DeltaSet) => {
  const result: (RangeRect & { url: string })[] = [];
  deltas.forEach((_, delta) => {
    if (!delta || delta.key !== Text.KEY) return void 0;
    const data = delta.getAttr(TEXT_ATTRS.DATA);
    const { x, y, width, height } = delta.getRect();
    const lines = data && TSON.parse<RichTextLines>(data);
    const matrices = text.parse(lines || [], width);
    let offsetX = x;
    let offsetY = y;
    // 迭代矩阵
    for (const matrix of matrices) {
      const offsetYBaseLine = offsetY + matrix.height;
      if (offsetYBaseLine > y + height) break;
      if (matrix.config[TEXT_ATTRS.DIVIDING_LINE]) {
        offsetX = x;
        offsetY = offsetY + DIVIDING_LINE_OFFSET;
        continue;
      }
      offsetX = offsetX + matrix.offsetX;
      const gap = matrix.break
        ? 0
        : Math.max(0, (width - matrix.width - matrix.offsetX) / matrix.items.length);
      const halfGap = gap / 2;
      // 迭代文字
      for (let i = 0; i < matrix.items.length; ++i) {
        const item = matrix.items[i];
        if (item.config[TEXT_ATTRS.LINK]) {
          let linkWidth = item.width + halfGap;
          // 聚合链接矩阵
          for (let k = i + 1; k < matrix.items.length; ++k) {
            const next = matrix.items[k];
            if (next.config[TEXT_ATTRS.LINK]) {
              linkWidth = linkWidth + next.width + halfGap;
              next.config[TEXT_ATTRS.LINK] = "";
            } else {
              break;
            }
          }
          result.push({
            x: offsetX - halfGap - Background.rect.x,
            y: offsetYBaseLine - matrix.originHeight - Background.rect.y,
            width: linkWidth,
            height: matrix.originHeight,
            url: item.config[TEXT_ATTRS.LINK] || "",
          });
        }
        offsetX = offsetX + item.width + gap;
      }
      offsetX = x;
      offsetY = offsetYBaseLine;
    }
  });
  return result;
};
