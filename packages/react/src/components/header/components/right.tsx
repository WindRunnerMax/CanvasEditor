import { Button } from "@arco-design/web-react";
import { IconGithub, IconRedo, IconUndo } from "@arco-design/web-react/icon";
import { useMemoizedFn } from "ahooks";
import type { FC } from "react";
import { useEffect, useState } from "react";
import type { Editor } from "sketching-core";
import { EDITOR_EVENT } from "sketching-core";
import { cs } from "sketching-utils";

import styles from "../index.m.scss";

export const Right: FC<{
  editor: Editor;
}> = ({ editor }) => {
  const [undoAble, setUndoAble] = useState<boolean>(false);
  const [redoAble, setRedoAble] = useState<boolean>(false);

  const query = useMemoizedFn(() => {
    setUndoAble(editor.history.canUndo());
    setRedoAble(editor.history.canRedo());
  });

  useEffect(() => {
    query();
    editor.event.on(EDITOR_EVENT.CONTENT_CHANGE, query);
    return () => {
      editor.event.off(EDITOR_EVENT.CONTENT_CHANGE, query);
    };
  }, [editor, query]);

  return (
    <div className={cs(styles.externalGroup)}>
      <div className={styles.history}>
        <Button
          onClick={() => editor.history.undo()}
          disabled={!undoAble}
          iconOnly
          icon={<IconUndo />}
          type="text"
          size="small"
        ></Button>
        <Button
          onClick={() => editor.history.redo()}
          disabled={!redoAble}
          iconOnly
          icon={<IconRedo />}
          type="text"
          size="small"
        ></Button>
      </div>
      <div className={styles.export} onClick={() => window.open("?preview", "_blank")}>
        导出
      </div>
      <a
        className={styles.github}
        target="_blank"
        href={"https://github.com/WindrunnerMax/CanvasEditor"}
      >
        <IconGithub />
      </a>
    </div>
  );
};
