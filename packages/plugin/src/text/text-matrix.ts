import { BLUE_6, GREEN_7, ORANGE_7, TEXT_1 } from "sketching-utils";

import { GRAY_4 } from "../../../utils/src/palette";
import { formatListSerial } from "../utils/list";
import { BACKGROUND_OFFSET, DIVIDING_LINE_OFFSET, TEXT_ATTRS } from "./constant";
import type { Attributes, RichTextLine, TextMatrix, TextMatrixItem } from "./types";

export const getLineOffset = (line: RichTextLine) => {
  let lineOffset = 0;
  const attrs = line.config;
  if (attrs[TEXT_ATTRS.UNORDERED_LIST_LEVEL] || attrs[TEXT_ATTRS.ORDERED_LIST_LEVEL]) {
    const base = attrs[TEXT_ATTRS.UNORDERED_LIST_LEVEL] || attrs[TEXT_ATTRS.ORDERED_LIST_LEVEL];
    if (base === "1") {
      lineOffset = lineOffset + 20;
    } else if (base === "2") {
      lineOffset = lineOffset + 40;
    } else if (base === "3") {
      lineOffset = lineOffset + 60;
    }
  }
  return lineOffset;
};

export const drawingList = (
  ctx: CanvasRenderingContext2D,
  attrs: Attributes,
  offsetX: number,
  middleOffsetY: number,
  offsetYBaseLine: number
) => {
  if (attrs[TEXT_ATTRS.BREAK_LINE_START]) return void 0;
  if (attrs[TEXT_ATTRS.UNORDERED_LIST_LEVEL]) {
    const radius = 2.5;
    ctx.beginPath();
    const base = attrs[TEXT_ATTRS.UNORDERED_LIST_LEVEL];
    ctx.fillStyle = BLUE_6;
    ctx.strokeStyle = BLUE_6;
    if (base === "1") {
      const x = offsetX + 10;
      ctx.arc(x, middleOffsetY, radius, 0, 2 * Math.PI);
      ctx.fill();
    } else if (base === "2") {
      const x = offsetX + 30;
      ctx.arc(x, middleOffsetY, radius, 0, 2 * Math.PI);
      ctx.stroke();
    } else if (base === "3") {
      const x = offsetX + 50;
      ctx.rect(x - radius, middleOffsetY - radius, radius * 2, radius * 2);
      ctx.fill();
    }
    ctx.closePath();
  }
  if (attrs[TEXT_ATTRS.ORDERED_LIST_START] && attrs[TEXT_ATTRS.ORDERED_LIST_LEVEL]) {
    const start = Number(attrs[TEXT_ATTRS.ORDERED_LIST_START]) || 1;
    const level = Number(attrs[TEXT_ATTRS.ORDERED_LIST_LEVEL]) || 1;
    let x = offsetX;
    const str = formatListSerial(start, level);
    if (!str) return void 0;
    if (level === 1) {
      x = offsetX + 6;
    } else if (level === 2) {
      x = offsetX + 26;
    } else if (level === 3) {
      x = offsetX + 46;
    }
    ctx.beginPath();
    ctx.textBaseline = "bottom";
    ctx.fillStyle = BLUE_6;
    ctx.fillText(str + ".", x, offsetYBaseLine);
    ctx.closePath();
  }
};

export const drawingDividingLine = (
  ctx: CanvasRenderingContext2D,
  matrix: TextMatrix,
  width: number,
  offsetX: number,
  offsetY: number
) => {
  if (matrix.config[TEXT_ATTRS.DIVIDING_LINE]) {
    ctx.beginPath();
    ctx.strokeStyle = GRAY_4;
    ctx.lineWidth = 1;
    const y = offsetY + DIVIDING_LINE_OFFSET;
    ctx.moveTo(offsetX, y);
    ctx.lineTo(offsetX + width, y);
    ctx.stroke();
    ctx.closePath();
    return true;
  }
  return false;
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
      offsetYBaseLine - matrix.originHeight - BACKGROUND_OFFSET - 1,
      backgroundWidth,
      matrix.originHeight + BACKGROUND_OFFSET * 2
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
