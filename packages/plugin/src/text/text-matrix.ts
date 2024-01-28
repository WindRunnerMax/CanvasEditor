import { TEXT_1 } from "sketching-utils";

import { TEXT_ATTRS } from "./constant";
import type { Attributes, TextMatrix, TextMatrixItem } from "./types";

export const drawingBackground = (
  ctx: CanvasRenderingContext2D,
  matrix: TextMatrix,
  item: TextMatrixItem,
  i: number,
  halfGap: number,
  offsetX: number,
  offsetYBaseLine: number
) => {
  if (item.config[TEXT_ATTRS.BACKGROUND]) {
    ctx.beginPath();
    const background = item.config[TEXT_ATTRS.BACKGROUND];
    let backgroundWidth = item.width + halfGap;
    for (let k = i + 1; k < matrix.items.length; ++k) {
      const next = matrix.items[k];
      if (next.config[TEXT_ATTRS.BACKGROUND] === background) {
        backgroundWidth = backgroundWidth + next.width + halfGap;
        next.config[TEXT_ATTRS.BACKGROUND] = "";
      } else {
        break;
      }
    }
    ctx.fillStyle = background;
    ctx.fillRect(
      offsetX - halfGap,
      offsetYBaseLine - matrix.height,
      backgroundWidth,
      matrix.height
    );
    ctx.closePath();
  }
};

export const drawingUnderline = (
  ctx: CanvasRenderingContext2D,
  item: TextMatrixItem,
  halfGap: number,
  offsetX: number,
  offsetYBaseLine: number
) => {
  if (item.config[TEXT_ATTRS.UNDERLINE]) {
    ctx.beginPath();
    ctx.strokeStyle = item.config[TEXT_ATTRS.COLOR] || TEXT_1;
    ctx.lineWidth = 1;
    ctx.moveTo(offsetX - halfGap, offsetYBaseLine);
    ctx.lineTo(offsetX + item.width + halfGap, offsetYBaseLine);
    ctx.stroke();
    ctx.closePath();
  }
};

export const drawingStrikeThrough = (
  ctx: CanvasRenderingContext2D,
  item: TextMatrixItem,
  halfGap: number,
  offsetX: number,
  offsetYBaseLine: number
) => {
  if (item.config[TEXT_ATTRS.STRIKE_THROUGH]) {
    ctx.beginPath();
    ctx.strokeStyle = item.config[TEXT_ATTRS.COLOR] || TEXT_1;
    ctx.lineWidth = 1;
    const halfHeight = item.height / 2;
    ctx.moveTo(offsetX - halfGap, offsetYBaseLine - halfHeight);
    ctx.lineTo(offsetX + item.width + halfGap, offsetYBaseLine - halfHeight);
    ctx.stroke();
    ctx.closePath();
  }
};
