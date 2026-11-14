import type { AttributeMap, Op } from "@block-kit/delta";

// Only visual inline marks: links, embeds and paragraph structure stay with the target.
const FORMAT_KEYS = [
  "bold",
  "italic",
  "underline",
  "strike",
  "inline-code",
  "color",
  "font-size",
  "background",
] as const;

/** Mixed selections use the first text run. Empty values clear the target's old marks. */
export const getTextFormat = (ops: Op[]): AttributeMap | null => {
  const source = ops.find(
    op =>
      typeof op.insert === "string" &&
      op.insert.replace(/\n/g, "").length > 0 &&
      !op.attributes?.image &&
      !op.attributes?.divider
  );
  if (!source) return null;
  const format: AttributeMap = {};
  FORMAT_KEYS.forEach(key => {
    format[key] = source.attributes?.[key] || "";
  });
  return format;
};
