import { Message } from "@arco-design/web-react";
import type { Editor } from "sketching-core";
import { Range } from "sketching-core";
import type { Delta } from "sketching-delta";
import { DeltaSet } from "sketching-delta";
import { DateTime, Storage } from "sketching-utils";

import { Background } from "../../../modules/background";
import type { LocalStorageData } from "../../../utils/storage";
import { EXAMPLE, STORAGE_KEY } from "../../../utils/storage";
import { parseLinks } from "./link";

export const exportPDF = async (DPI = 1) => {
  if (!window.PDFDocument || !window.blobStream) {
    Message.warning("PDF模块未加载完成，请稍后");
  }
  const data = Storage.local.get<LocalStorageData>(STORAGE_KEY) || EXAMPLE;
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
  const deltas: Delta[] = [];
  const tasks: Promise<Delta>[] = [];
  deltaSet.forEach((_, delta) => deltas.push(delta));
  deltas.sort((a, b) => a.getZ() - b.getZ());
  deltas.forEach(delta => {
    const task = delta.drawing(ctx);
    task && tasks.push(task);
  });
  await Promise.all(tasks).then(delta => {
    delta.forEach(it => it.drawing(ctx));
  });
  const base64 = canvas.toDataURL("image/jpeg");
  const links = parseLinks(deltaSet);
  const doc = new window.PDFDocument({
    size: [width, height],
  });
  links.forEach(link => {
    doc.link(link.x, link.y, link.width, link.height, link.url);
  });
  doc.image(base64, 0, 0, { width, height });
  const stream = doc.pipe(window.blobStream());
  doc.end();
  stream.on("finish", function () {
    const url = stream.toBlobURL("application/pdf");
    const a = document.createElement("a");
    a.href = url;
    const now = new DateTime().format("yyyyMMdd_hhmmss");
    a.download = "RESUME_" + now + ".pdf";
    a.click();
  });
};

export const exportJSON = (editor: Editor) => {
  const deltaSetLike = editor.deltaSet.getDeltas();
  const storageData = { ...Background.rect, deltaSetLike };
  const str = JSON.stringify(storageData, null, 2);
  const blob = new Blob([str], { type: "application/json;charset=utf-8" });
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  const now = new DateTime().format("yyyyMMdd_hhmmss");
  a.download = "RESUME_" + now + ".json";
  a.click();
};
