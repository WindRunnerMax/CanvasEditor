import { TEXT_1, toFixedNumber } from "sketching-utils";

import type {
  Attributes,
  RichTextLines,
  TextMatrices,
  TextMatrix,
  TextMatrixItem,
} from "./constant";
import { TEXT_ATTRS } from "./constant";

export class RichText {
  private ctx: CanvasRenderingContext2D;
  private map: Map<string, TextMetrics>;
  constructor() {
    this.map = new Map();
    const canvas = document.createElement("canvas");
    this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  }

  private getFont = (config: Attributes) => {
    const fontFamily =
      config[TEXT_ATTRS.FAMILY] ||
      "Inter, -apple-system, BlinkMacSystemFont, PingFang SC, Hiragino Sans GB, noto sans, Microsoft YaHei, Helvetica Neue, Helvetica, Arial, sans-serif";
    const fontSize = config[TEXT_ATTRS.SIZE] || 14;
    const fontWeight = config[TEXT_ATTRS.WEIGHT] || "normal";
    const fontStyle = config[TEXT_ATTRS.STYLE] || "normal";
    return `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
  };

  public measure = (text: string, config: Attributes) => {
    const font = this.getFont(config);
    this.ctx.font = font;
    const key = `${font}-${text}`;
    if (this.map.has(key)) {
      return { metric: this.map.get(key), font };
    }
    const metric = this.ctx.measureText(text);
    this.map.set(key, metric);
    return { metric, font };
  };

  public parse = (lines: RichTextLines, width: number) => {
    const group: TextMatrices = [];
    for (const line of lines) {
      const lineHeight = Number(line.config[TEXT_ATTRS.LINE_HEIGHT]) || 1.5;
      // COMPAT: 高度给予最小值
      let matrix: TextMatrix = { items: [], height: 12 * lineHeight, width: 0 };
      for (const item of line.chars) {
        const { metric, font } = this.measure(item.char, item.config);
        if (!metric) continue;
        const text: TextMatrixItem = {
          char: item.char,
          font,
          config: item.config,
          width: toFixedNumber(metric.width),
          height: 0,
          descent: toFixedNumber(metric.actualBoundingBoxDescent),
        };
        if (matrix.width + text.width > width) {
          group.push(matrix);
          // 重置行`matrix`
          matrix = { items: [], height: 12 * lineHeight, width: 0 };
        }
        const fontHeight = toFixedNumber(
          metric.actualBoundingBoxAscent + metric.actualBoundingBoxDescent
        );
        text.height = toFixedNumber(fontHeight * lineHeight);
        matrix.height = Math.max(matrix.height, fontHeight * lineHeight);
        matrix.width = matrix.width + text.width;
        matrix.items.push(text);
      }
      matrix.break = true;
      group.push(matrix);
    }
    return group;
  };

  public render = (
    matrices: TextMatrices,
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.rect(x, y, width, height);
    this.ctx.clip();
    ctx.textBaseline = "bottom";
    let offsetX = x;
    let offsetY = y;
    for (const matrix of matrices) {
      const calibratedOffsetY = offsetY + matrix.height;
      if (calibratedOffsetY > y + height) break;
      const gap = matrix.break ? 0 : Math.max(0, (width - matrix.width) / matrix.items.length);
      const halfGap = gap / 2;
      for (let i = 0; i < matrix.items.length; ++i) {
        const item = matrix.items[i];
        // 连续绘制背景
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
            calibratedOffsetY - matrix.height,
            backgroundWidth,
            matrix.height
          );
          ctx.closePath();
        }
        // 绘制文字
        ctx.font = item.font;
        ctx.fillStyle = item.config[TEXT_ATTRS.COLOR] || TEXT_1;
        ctx.fillText(item.char, offsetX, calibratedOffsetY);
        // 绘制下划线
        if (item.config[TEXT_ATTRS.UNDERLINE]) {
          ctx.beginPath();
          ctx.strokeStyle = item.config[TEXT_ATTRS.COLOR] || TEXT_1;
          ctx.lineWidth = 1;
          ctx.moveTo(offsetX - halfGap, calibratedOffsetY);
          ctx.lineTo(offsetX + item.width + halfGap, calibratedOffsetY);
          ctx.stroke();
          ctx.closePath();
        }
        // 绘制中划线
        if (item.config[TEXT_ATTRS.STRIKE_THROUGH]) {
          ctx.beginPath();
          ctx.strokeStyle = item.config[TEXT_ATTRS.COLOR] || TEXT_1;
          ctx.lineWidth = 1;
          const halfHeight = item.height / 2;
          ctx.moveTo(offsetX - halfGap, calibratedOffsetY - halfHeight);
          ctx.lineTo(offsetX + item.width + halfGap, calibratedOffsetY - halfHeight);
          ctx.stroke();
          ctx.closePath();
        }
        offsetX = offsetX + item.width + gap;
      }
      offsetX = x;
      offsetY = calibratedOffsetY;
    }
    this.ctx.closePath();
    this.ctx.restore();
  };
}
