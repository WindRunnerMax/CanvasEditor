import { Point, Range, RawPoint } from "@block-kit/core";
import { Delta } from "@block-kit/delta";
import type { ShortcutFuncMap } from "@block-kit/plugin";
import { DIVIDER_KEY, isKeyCode } from "@block-kit/plugin";
import { KEY_CODE, TRULY } from "@block-kit/utils";

export const PRESET_SHORTCUT: ShortcutFuncMap = {
  [DIVIDER_KEY]: (event, payload) => {
    if (isKeyCode(event, KEY_CODE.SPACE) && payload.sel && payload.sel.isCollapsed) {
      const { editor, sel } = payload;
      const line = editor.state.block.getLine(sel.start.line);
      const firstLeaf = line && line.getFirstLeaf();
      const text = firstLeaf && firstLeaf.getText();
      if (text === "---") {
        editor.perform.deleteForward(Range.fromTuple([sel.start.line, 0], [sel.start.line, 3]));
        const start = RawPoint.fromPoint(editor, new Point(sel.start.line, 0));
        if (!start) return void 0;
        const delta = new Delta().retain(start.offset).insert(" ", { [DIVIDER_KEY]: TRULY });
        editor.state.apply(delta);
        event.preventDefault();
        return true;
      }
    }
  },
};
