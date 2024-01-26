import { IconPlus } from "@arco-design/web-react/icon";
import type { FC } from "react";
import { useEffect, useState } from "react";
import { EDITOR_EVENT } from "sketching-core";
import { cs } from "sketching-utils";

import { useEditor } from "../../hooks/use-editor";
import { NAV_ENUM } from "../header/constant";
import { Rect } from "./components/rect";
import styles from "./index.m.scss";

export const RightPanel: FC = () => {
  const { editor } = useEditor();
  const [collapse, setCollapse] = useState(false);
  const [active, setActive] = useState<string[]>([]);

  useEffect(() => {
    const onSelect = () => {
      setActive([...editor.selection.getActiveDeltaIds()]);
    };
    editor.event.on(EDITOR_EVENT.SELECTION_CHANGE, onSelect);
    return () => {
      editor.event.off(EDITOR_EVENT.SELECTION_CHANGE, onSelect);
    };
  }, [editor]);

  const loadEditor = () => {
    const id = active.length === 1 && active[0];
    if (!id) return null;
    const state = editor.state.getDeltaState(id);
    if (!state) return null;
    switch (state.key) {
      case NAV_ENUM.RECT:
        return <Rect editor={editor} state={state}></Rect>;
      default:
        return null;
    }
  };

  return (
    <div className={cs(styles.container, collapse && styles.collapse)}>
      <div className={cs(styles.op)} onClick={() => setCollapse(!collapse)}>
        <IconPlus />
      </div>
      <div className={styles.scroll}>
        {active.length === 0 && "请选择图形"}
        {active.length > 1 && "图形多选状态"}
        {active.length === 1 && loadEditor()}
      </div>
    </div>
  );
};
