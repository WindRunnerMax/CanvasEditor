import type { Op } from "@block-kit/delta";
import { Delta } from "@block-kit/delta";

import { getTextFormat } from "../src/components/right-panel/components/text/utils/format-painter";

describe("text format painter", () => {
  it("copies the first text run without copying links or structural attributes", () => {
    const source = new Delta()
      .insert("Source", { bold: "true", color: "#f00", link: "https://source.example" })
      .insert("Mixed", { "italic": "true", "font-size": "24" })
      .insertEOL({ "list": "bullet", "line-height": "2" });
    const snapshot = JSON.stringify(source.ops);
    const format = getTextFormat(source.ops);
    expect(format).toMatchObject({
      "bold": "true",
      "color": "#f00",
      "italic": "",
      "font-size": "",
    });
    expect(format).not.toHaveProperty("link");
    expect(format).not.toHaveProperty("list");
    expect(format).not.toHaveProperty("line-height");
    expect(JSON.stringify(source.ops)).toBe(snapshot);
  });

  it("replaces existing styles while preserving target text, links and paragraphs", () => {
    const target = new Delta()
      .insert("Target", {
        "italic": "true",
        "underline": "true",
        "font-size": "24",
        "background": "#ff0",
        "link": "https://target.example",
      })
      .insertEOL({ "list": "bullet", "line-height": "2" });
    const format = getTextFormat([{ insert: "Source", attributes: { bold: "true" } }])!;
    const change = new Delta().retain(6, format);
    const result = target.compose(change);
    expect(result.ops).toEqual([
      { insert: "Target", attributes: { bold: "true", link: "https://target.example" } },
      { insert: "\n", attributes: { "list": "bullet", "line-height": "2" } },
    ]);
    expect(result.compose(change.invert(target)).ops).toEqual(target.ops);
  });

  it("can paint plain text formatting over every supported visual mark", () => {
    const marks = {
      "bold": "true",
      "italic": "true",
      "underline": "true",
      "strike": "true",
      "inline-code": "true",
      "color": "#f00",
      "font-size": "24",
      "background": "#ff0",
    };
    const format = getTextFormat([{ insert: "Plain" }])!;
    const target = new Delta().insert("Styled", marks).insertEOL();
    expect(target.compose(new Delta().retain(6, format)).ops).toEqual([{ insert: "Styled\n" }]);
    expect(getTextFormat([{ insert: "Styled", attributes: marks }])).toEqual(marks);
  });

  it("skips newlines, images and dividers when finding source text", () => {
    const ops: Op[] = [
      { insert: "\n", attributes: { list: "bullet" } },
      { insert: " ", attributes: { image: "true" } },
      { insert: " ", attributes: { divider: "true" } },
      { insert: "Source", attributes: { color: "#123456" } },
    ];
    expect(getTextFormat(ops)).toMatchObject({ color: "#123456" });
    expect(getTextFormat(ops.slice(0, 3))).toBeNull();
    expect(getTextFormat([])).toBeNull();
  });
});
