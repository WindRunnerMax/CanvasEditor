import { Button, Tooltip } from "@arco-design/web-react";
import type { Editor } from "@block-kit/core";
import { EDITOR_EVENT } from "@block-kit/core";
import { useMemoFn } from "@block-kit/utils/dist/es/hooks";
import type { FC } from "react";
import { useEffect, useState } from "react";

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
    <div className="text-format-painter" aria-live="polite">
      <Tooltip position="bottom" content="选中源文字后点击，再选中目标文字应用格式；Esc 取消">
        <Button
          size="mini"
          type={format ? "primary" : "secondary"}
          disabled={!format && !canCopy}
          aria-pressed={!!format}
          onMouseDown={event => event.preventDefault()}
          onClick={onCopy}
        >
          {format ? "取消格式刷" : "格式刷"}
        </Button>
      </Tooltip>
      {format && <span>请选择目标文字（Esc 取消）</span>}
    </div>
  );
};
