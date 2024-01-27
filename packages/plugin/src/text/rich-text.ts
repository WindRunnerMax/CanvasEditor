import { TEXT_1 } from "sketching-utils";

import type { RichTextLines, TextMatrices, TextMatrix, TextMatrixItem } from "./constant";
import { TEXT_ATTRS } from "./constant";

export class RichText {
  private ctx: CanvasRenderingContext2D;
  private map: Map<string, TextMetrics>;
  constructor() {
    this.map = new Map();
    const canvas = document.createElement("canvas");
    this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  }

  private getFont = (config: Record<string, string>) => {
    const fontFamily =
      config[TEXT_ATTRS.FAMILY] ||
      "Inter, -apple-system, BlinkMacSystemFont, PingFang SC, Hiragino Sans GB, noto sans, Microsoft YaHei, Helvetica Neue, Helvetica, Arial, sans-serif";
    const fontSize = config[TEXT_ATTRS.SIZE] || 14;
    const fontWeight = config[TEXT_ATTRS.WEIGHT] || "normal";
    const fontStyle = config[TEXT_ATTRS.STYLE] || "normal";
    return `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
  };

  public measure = (text: string, config: Record<string, string>) => {
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
          metric,
          config: item.config,
          width: 0,
          height: 0,
        };
        if (matrix.width + metric.width > width) {
          group.push(matrix);
          // 重置行`matrix`
          matrix = { items: [], height: 12 * lineHeight, width: 0 };
        }
        const fontHeight = metric.actualBoundingBoxAscent + metric.actualBoundingBoxDescent;
        text.height = fontHeight * lineHeight;
        text.width = metric.width;
        matrix.height = Math.max(matrix.height, fontHeight * lineHeight);
        matrix.width = matrix.width + metric.width;
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
      for (const item of matrix.items) {
        // 绘制背景
        if (item.config[TEXT_ATTRS.BACKGROUND]) {
          ctx.beginPath();
          ctx.fillStyle = item.config[TEXT_ATTRS.BACKGROUND];
          ctx.rect(
            offsetX - halfGap,
            calibratedOffsetY - matrix.height,
            item.metric.width + gap,
            matrix.height
          );
          ctx.fill();
          ctx.closePath();
        }
        // 绘制文字
        ctx.font = item.font;
        ctx.fillStyle = item.config.color || TEXT_1;
        ctx.fillText(item.char, offsetX, calibratedOffsetY);
        // 绘制下划线
        if (item.config[TEXT_ATTRS.UNDERLINE]) {
          ctx.beginPath();
          ctx.strokeStyle = item.config.color || TEXT_1;
          ctx.lineWidth = 1;
          ctx.moveTo(offsetX - halfGap, calibratedOffsetY);
          ctx.lineTo(offsetX + item.metric.width + halfGap, calibratedOffsetY);
          ctx.stroke();
          ctx.closePath();
        }
        // 绘制中划线
        if (item.config[TEXT_ATTRS.STRIKE_THROUGH]) {
          ctx.beginPath();
          ctx.strokeStyle = item.config.color || TEXT_1;
          ctx.lineWidth = 1;
          const halfHeight = item.height / 2;
          ctx.moveTo(offsetX - halfGap, calibratedOffsetY - halfHeight);
          ctx.lineTo(offsetX + item.metric.width + halfGap, calibratedOffsetY - halfHeight);
          ctx.stroke();
          ctx.closePath();
        }
        offsetX = offsetX + item.metric.width + gap;
      }

      offsetX = x;
      offsetY = calibratedOffsetY;
    }
    this.ctx.closePath();
    this.ctx.restore();
  };
}
