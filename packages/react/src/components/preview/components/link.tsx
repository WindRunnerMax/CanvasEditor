import type { FC } from "react";
import React, { useMemo } from "react";
import type { Editor, RangeRect } from "sketching-core";
import type { RichTextLines } from "sketching-plugin";
import { RichText, Text, TEXT_ATTRS } from "sketching-plugin";
import { TSON } from "sketching-utils";

import { Background } from "../../../modules/background";

const text = new RichText();

export const Links: FC<{
  editor: Editor;
}> = ({ editor }) => {
  const links = useMemo(() => {
    const deltas = editor.deltaSet;
    const result: (RangeRect & { url: string })[] = [];
    deltas.forEach((_, delta) => {
      if (!delta || delta.key !== Text.KEY) return void 0;
      const data = delta.getAttr(TEXT_ATTRS.DATA);
      const { x, y, width, height } = delta.getRect();
      const lines = data && TSON.parse<RichTextLines>(data);
      const matrices = text.parse(lines || [], width);
      let offsetX = x;
      let offsetY = y;
      for (const matrix of matrices) {
        const offsetYBaseLine = offsetY + matrix.height;
        if (offsetYBaseLine > y + height) break;
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
  }, [editor]);

  return (
    <React.Fragment>
      {links.map((link, index) => (
        <React.Fragment key={index}>
          <a
            style={{
              position: "absolute",
              left: link.x + "px",
              top: link.y + "px",
              display: "block",
              width: link.width + "px",
              height: link.height + "px",
            }}
            href={link.url}
            target="_blank"
          ></a>
        </React.Fragment>
      ))}
    </React.Fragment>
  );
};
