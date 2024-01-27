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
      // COMPAT: 高度给予最小值
      let matrix: TextMatrix = { items: [], height: 12 * 1.5, width: 0 };
      for (const item of line.chars) {
        const { metric, font } = this.measure(item.char, item.config);
        if (!metric) continue;
        const text: TextMatrixItem = { char: item.char, font, metric, config: item.config };
        if (matrix.width + metric.width > width) {
          group.push(matrix);
          // 重置行`matrix`
          matrix = { items: [], height: 12 * 1.5, width: 0 };
        }
        const fontHeight = metric.actualBoundingBoxAscent + metric.actualBoundingBoxDescent;
        matrix.height = Math.max(matrix.height, fontHeight * 1.5);
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
      if (offsetY + matrix.height > y + height) break;
      const gap = Math.max(0, (width - matrix.width) / matrix.items.length);
      for (const item of matrix.items) {
        ctx.font = item.font;
        ctx.fillStyle = item.config.color || TEXT_1;
        ctx.fillText(item.char, offsetX, offsetY + matrix.height);
        offsetX = offsetX + item.metric.width;
        if (!matrix.break) offsetX = offsetX + gap;
      }
      ctx.beginPath();
      ctx.moveTo(offsetX, offsetY + matrix.height);
      ctx.lineTo(x, offsetY + matrix.height);
      ctx.stroke();
      ctx.closePath();
      offsetX = x;
      offsetY = offsetY + matrix.height;
    }
    this.ctx.closePath();
    this.ctx.restore();
  };
}
