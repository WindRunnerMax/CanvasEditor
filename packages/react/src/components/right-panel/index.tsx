import type { FC } from "react";
import { useEffect, useState } from "react";
import { EDITOR_EVENT } from "sketching-core";
import { cs } from "sketching-utils";

import { useEditor } from "../../hooks/use-editor";
import styles from "./index.m.scss";

export const RightPanel: FC = () => {
  const { editor } = useEditor();
  const [active, setActive] = useState<string[]>([]);

  useEffect(() => {
    const onSelect = () => {
      setActive([...editor.selection.getActiveDeltaId()]);
    };
    editor.event.on(EDITOR_EVENT.SELECTION_CHANGE, onSelect);
    return () => {
      editor.event.off(EDITOR_EVENT.SELECTION_CHANGE, onSelect);
    };
  }, [editor]);

  return (
    <div className={cs(styles.container)}>
      {active.length === 0 ? "请选择图形" : active.length > 1 ? "多选" : ""}
    </div>
  );
};
