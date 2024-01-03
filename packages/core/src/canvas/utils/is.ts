import type { Point } from "../../selection/point";
import type { Range } from "../../selection/range";
import { RESIZE_OFS } from "./constant";

export const isInSelectRange = (point: Point, range: Range) => {
  // 严格判断点击区域 选区的`Range`需要排除八向占位
  const { startX, startY, endX, endY } = range.flat();
  const center = range.center();
  const { x, y } = point;
  const offset = RESIZE_OFS / 2;
  const startX1OFS = startX + RESIZE_OFS;
  const startY1OFS = startY + RESIZE_OFS;
  const endX0OFS = endX - RESIZE_OFS;
  const endY0OFS = endY - RESIZE_OFS;
  const startX1Offset = startX + offset;
  const endX0Offset = endX - offset;
  const startY1Offset = startY + offset;
  const endY0Offset = endY - offset;
  const centerY0OFS = center.y - RESIZE_OFS;
  const centerY1OFS = center.y + RESIZE_OFS;
  const centerX0OFS = center.x - RESIZE_OFS;
  const centerX1OFS = center.x + RESIZE_OFS;
  if (
    // `Range`范围内
    x >= startX &&
    x <= endX &&
    y >= startY &&
    y <= endY &&
    // 排除对角线向占位
    !(x <= startX1OFS && y <= startY1OFS) &&
    !(x >= endX0OFS && y <= startY1OFS) &&
    !(x <= startX1OFS && y >= endY0OFS) &&
    !(x >= endX0OFS && y >= endY0OFS) &&
    // 排除中心线向占位
    !(x <= startX1Offset && y >= centerY0OFS && y <= centerY1OFS) &&
    !(x >= endX0Offset && y >= centerY0OFS && y <= centerY1OFS) &&
    !(y <= startY1Offset && x >= centerX0OFS && x <= centerX1OFS) &&
    !(y >= endY0Offset && x >= centerX0OFS && x <= centerX1OFS)
  ) {
    return true;
  }
  return false;
};
