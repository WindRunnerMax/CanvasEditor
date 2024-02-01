import { Message } from "@arco-design/web-react";
import { Range } from "sketching-core";
import { DeltaSet } from "sketching-delta";
import { storage } from "sketching-utils";

import { Background } from "../../../modules/background";
import type { LocalStorageData } from "../../../utils/storage";
import { EXAMPLE, STORAGE_KEY } from "../../../utils/storage";

export const exportPDF = (DPI = 1) => {
  if (!window.PDFDocument || !window.blobStream) {
    Message.warning("PDF模块未加载完成，请稍后");
  }
  const data = storage.local.get<LocalStorageData>(STORAGE_KEY) || EXAMPLE;
  const deltaSetLike = data && data.deltaSetLike;
  Background.setRange(Range.fromRect(data.x, data.y, data.width, data.height));
  const deltaSet = new DeltaSet(deltaSetLike);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  const { x, y, width, height } = Background.rect;
  const ratio = Math.ceil(window.devicePixelRatio * 1 || 1) * DPI;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  canvas.style.width = width + "px";
  canvas.style.height = height + "px";
  canvas.style.position = "absolute";
  ctx.scale(ratio, ratio);
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, width, height);
  ctx.translate(-x, -y);
  deltaSet.forEach((_, delta) => {
    delta.drawing(ctx);
  });
  const base64 = canvas.toDataURL("image/jpeg");
  document.body.appendChild(canvas);
  const doc = new window.PDFDocument({
    size: [width, height],
  });
  doc.image(base64, 0, 0, { width, height });
  const stream = doc.pipe(window.blobStream());
  doc.end();
  stream.on("finish", function () {
    const url = stream.toBlobURL("application/pdf");
    const a = document.createElement("a");
    a.href = url;
    a.download = "Resume.pdf";
    a.click();
  });
};
