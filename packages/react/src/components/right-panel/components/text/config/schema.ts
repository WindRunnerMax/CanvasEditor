import type { EditorSchema } from "@block-kit/core";

export const schema: EditorSchema = {
  "bold": { mark: true },
  "italic": { mark: true },
  "underline": { mark: true },
  "strike": { mark: true },
  "inline-code": { mark: true, inline: true },
  "link": { mark: true, inline: true },
  "color": { mark: true },
  "font-size": { mark: true },
  "background": { mark: true },
  "divider": { block: true, void: true },
};
