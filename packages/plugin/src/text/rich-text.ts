import type { TextLines, TextMatrices, TextMatrix, TextMatrixItem } from "./constant";
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
    const fontFamily = config[TEXT_ATTRS.FAMILY] || "sans-serif";
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

  public parse = (lines: TextLines, width: number) => {
    const group: TextMatrices = [];
    for (const line of lines) {
      let matrix: TextMatrix = { items: [], height: 0, width: 0 };
      for (const item of line) {
        const { metric, font } = this.measure(item.char, item.config);
        if (!metric) continue;
        const text: TextMatrixItem = { char: item.char, font, metric };
        if (matrix.width + metric.width > width) {
          group.push(matrix);
          // 重置行`matrix`
          matrix = { items: [], height: 0, width: 0 };
        }
        matrix.height = Math.max(
          matrix.height,
          metric.actualBoundingBoxAscent + metric.actualBoundingBoxDescent
        );
        matrix.width = matrix.width + metric.width;
        matrix.items.push(text);
      }
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
    let offsetX = x;
    let offsetY = y;
    for (const matrix of matrices) {
      for (const item of matrix.items) {
        ctx.font = item.font;
        ctx.fillText(item.char, offsetX, offsetY + matrix.height);
        offsetX = offsetX + item.metric.width;
      }
      offsetX = x;
      offsetY = offsetY + matrix.height;
      if (offsetY > y + height) break;
    }
    this.ctx.closePath();
    this.ctx.restore();
  };
}
