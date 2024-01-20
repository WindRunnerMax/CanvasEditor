export type RectProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  borderWidth?: number;
  borderColor?: string;
  fillColor?: string;
};

export type ArcProps = {
  x: number;
  y: number;
  radius: number;
  borderWidth?: number;
  borderColor?: string;
  fillColor?: string;
};

export class Shape {
  static rect(ctx: CanvasRenderingContext2D, options: RectProps) {
    ctx.beginPath();
    ctx.rect(options.x, options.y, options.width, options.height);
    if (options.borderColor) {
      ctx.strokeStyle = options.borderColor;
      ctx.lineWidth = options.borderWidth || 1;
      ctx.stroke();
    }
    if (options.fillColor) {
      ctx.fillStyle = options.fillColor;
      ctx.fill();
    }
    ctx.closePath();
  }

  static arc(ctx: CanvasRenderingContext2D, options: ArcProps) {
    ctx.beginPath();
    ctx.arc(options.x, options.y, options.radius, 0, 2 * Math.PI);
    if (options.borderColor) {
      ctx.strokeStyle = options.borderColor;
      ctx.lineWidth = options.borderWidth || 1;
      ctx.stroke();
    }
    if (options.fillColor) {
      ctx.fillStyle = options.fillColor;
      ctx.fill();
    }
    ctx.closePath();
  }
}
