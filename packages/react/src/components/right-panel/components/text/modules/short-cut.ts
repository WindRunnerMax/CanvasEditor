import type { ShortcutFuncMap } from "@block-kit/plugin";
import { HEADING_KEY } from "@block-kit/plugin";

export const PRESET_SHORTCUT: ShortcutFuncMap = {
  [HEADING_KEY]: () => {
    // 覆盖默认的标题快捷键
    return void 0;
  },
};
