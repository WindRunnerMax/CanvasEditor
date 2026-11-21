import { IconBrush } from "@arco-design/web-react/icon";
import type { Editor } from "@block-kit/core";
import { EDITOR_EVENT } from "@block-kit/core";
import { useMemoFn } from "@block-kit/utils/dist/es/hooks";
import type { FC } from "react";
import { useEffect, useState } from "react";
import { cs } from "sketching-utils";

import { useFormatPainter } from "../../../../../hooks/use-format-painter";
import { getTextFormat } from "../utils/format-painter";

export const FormatPainter: FC<{ editor: Editor }> = ({ editor }) => {
  const { format, setFormat } = useFormatPainter();
  const [canCopy, setCanCopy] = useState(false);

  const refreshSelection = useMemoFn(() => {
    const selection = editor.selection.get();
    const fragment = selection && !selection.isCollapsed && editor.lookup.getFragment(selection);
    setCanCopy(!!fragment && !!getTextFormat(fragment));
  });

  useEffect(() => {
    editor.event.on(EDITOR_EVENT.SELECTION_CHANGE, refreshSelection);
    editor.event.on(EDITOR_EVENT.CONTENT_CHANGE, refreshSelection);
    refreshSelection();
    return () => {
      editor.event.off(EDITOR_EVENT.SELECTION_CHANGE, refreshSelection);
      editor.event.off(EDITOR_EVENT.CONTENT_CHANGE, refreshSelection);
    };
  }, [editor, refreshSelection]);

  const onCopy = () => {
    if (format) {
      setFormat(null);
      return;
    }
    const selection = editor.selection.get();
    const fragment = selection && !selection.isCollapsed && editor.lookup.getFragment(selection);
    if (fragment) setFormat(getTextFormat(fragment));
  };

  return (
    <button
      type="button"
      className={cs("menu-toolbar-item", "text-format-painter", format && "active")}
      disabled={!format && !canCopy}
      aria-label="格式刷"
      aria-pressed={!!format}
      onMouseDown={event => event.preventDefault()}
      onClick={onCopy}
    >
      <IconBrush />
    </button>
  );
};
