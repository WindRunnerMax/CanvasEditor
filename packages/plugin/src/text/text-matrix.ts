import { BLUE_6, GREEN_7, ORANGE_7, TEXT_1 } from "sketching-utils";

import { TEXT_ATTRS } from "./constant";
import type { Attributes, RichTextLine, TextMatrix, TextMatrixItem } from "./types";

export const getLineOffset = (line: RichTextLine) => {
  let lineOffset = 0;
  const attrs = line.config;
  if (attrs[TEXT_ATTRS.UNORDERED_LIST_LEVEL] || attrs[TEXT_ATTRS.ORDERED_LIST_LEVEL]) {
    const base = attrs[TEXT_ATTRS.UNORDERED_LIST_LEVEL] || attrs[TEXT_ATTRS.ORDERED_LIST_LEVEL];
    switch (base) {
      case "1": {
        lineOffset = lineOffset + 20;
        break;
      }
      case "2": {
        lineOffset = lineOffset + 40;
        break;
      }
      case "3": {
        lineOffset = lineOffset + 60;
        break;
      }
      default:
        break;
    }
  }
  return lineOffset;
};

export const drawingList = (
  ctx: CanvasRenderingContext2D,
  matrix: TextMatrix,
  attrs: Attributes,
  offsetX: number,
  middleOffsetY: number
) => {
  const listOffsetX = matrix.offsetX;
  if (attrs[TEXT_ATTRS.UNORDERED_LIST_LEVEL]) {
    const radius = 2.5;
    ctx.beginPath();
    const base = attrs[TEXT_ATTRS.UNORDERED_LIST_LEVEL];
    switch (base) {
      case "1": {
        const x = offsetX + listOffsetX / 2;
        ctx.fillStyle = BLUE_6;
        ctx.arc(x, middleOffsetY, radius, 0, 2 * Math.PI);
        ctx.fill();
        break;
      }
      case "2": {
        break;
      }
      case "3": {
        break;
      }
      default:
        break;
    }
    ctx.closePath();
  }
};

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
  matrix: TextMatrix,
  item: TextMatrixItem,
  halfGap: number,
  offsetX: number,
  offsetYBaseLine: number
) => {
  if (item.config[TEXT_ATTRS.UNDERLINE]) {
    ctx.beginPath();
    ctx.strokeStyle = item.config[TEXT_ATTRS.COLOR] || TEXT_1;
    ctx.lineWidth = 1;
    const bottomOffsetY = offsetYBaseLine;
    ctx.moveTo(offsetX - halfGap, bottomOffsetY);
    ctx.lineTo(offsetX + item.width + halfGap, bottomOffsetY);
    ctx.stroke();
    ctx.closePath();
  }
};

export const drawingStrikeThrough = (
  ctx: CanvasRenderingContext2D,
  item: TextMatrixItem,
  halfGap: number,
  offsetX: number,
  middleOffsetY: number
) => {
  if (item.config[TEXT_ATTRS.STRIKE_THROUGH]) {
    ctx.beginPath();
    ctx.strokeStyle = item.config[TEXT_ATTRS.COLOR] || TEXT_1;
    ctx.lineWidth = 1;
    ctx.moveTo(offsetX - halfGap, middleOffsetY);
    ctx.lineTo(offsetX + item.width + halfGap, middleOffsetY);
    ctx.stroke();
    ctx.closePath();
  }
};

export const drawingDebugLine = (
  ctx: CanvasRenderingContext2D,
  matrix: TextMatrix,
  item: TextMatrixItem,
  halfGap: number,
  offsetX: number,
  offsetY: number,
  offsetYBaseLine: number
) => {
  const end = offsetYBaseLine;
  ctx.beginPath();
  ctx.strokeStyle = ORANGE_7;
  ctx.lineWidth = 1;
  ctx.moveTo(offsetX, end);
  ctx.lineTo(offsetX + item.width, end);
  ctx.stroke();
  ctx.closePath();
  ctx.beginPath();
  ctx.strokeStyle = ORANGE_7;
  ctx.lineWidth = 1;
  ctx.moveTo(offsetX, end - item.height);
  ctx.lineTo(offsetX + item.width, end - item.height);
  ctx.stroke();
  ctx.closePath();
  ctx.beginPath();
  ctx.strokeStyle = GREEN_7;
  ctx.lineWidth = 1;
  ctx.moveTo(offsetX, end - item.height + item.ascent);
  ctx.lineTo(offsetX + item.width, end - item.height + item.ascent);
  ctx.stroke();
  ctx.closePath();
  ctx.beginPath();
  ctx.strokeStyle = GREEN_7;
  ctx.lineWidth = 1;
  ctx.moveTo(offsetX, end - item.descent);
  ctx.lineTo(offsetX + item.width, end - item.descent);
  ctx.stroke();
  ctx.closePath();
};
