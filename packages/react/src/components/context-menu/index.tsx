import { Message } from "@arco-design/web-react";
import type { FC } from "react";
import React, { useEffect, useState } from "react";
import { EDITOR_EVENT } from "sketching-core";
import { Op, OP_TYPE } from "sketching-delta";

import { useEditor } from "../../hooks/use-editor";
import { Divider } from "./components/divider";
import { Portal } from "./components/portal";
import styles from "./index.m.scss";

export const ContextMenu: FC = () => {
  const [top, setTop] = useState(0);
  const [left, setLeft] = useState(0);
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState<string[]>([]);

  const { editor } = useEditor();

  useEffect(() => {
    const onEnableVisible = (e: MouseEvent) => {
      setVisible(true);
      setTop(e.clientY + 1);
      setLeft(e.clientX + 1);
      setActive([...editor.selection.getActiveDeltaIds()]);
    };
    const onDisableVisible = () => setVisible(false);
    editor.event.on(EDITOR_EVENT.CONTEXT_MENU, onEnableVisible);
    editor.event.on(EDITOR_EVENT.MOUSE_DOWN, onDisableVisible);
    editor.event.on(EDITOR_EVENT.MOUSE_WHEEL, onDisableVisible);
    return () => {
      editor.event.on(EDITOR_EVENT.MOUSE_WHEEL, onDisableVisible);
      editor.event.off(EDITOR_EVENT.MOUSE_DOWN, onDisableVisible);
      editor.event.off(EDITOR_EVENT.CONTEXT_MENU, onEnableVisible);
    };
  }, [editor.event, editor.selection]);

  const onClickProxy = (e: React.MouseEvent) => {
    setVisible(false);
    e.stopPropagation();
    e.preventDefault();
  };

  const onCopy = (e: React.MouseEvent) => {
    editor.canvas.mask.focus();
    document.execCommand("copy");
    e.preventDefault();
  };

  const onClipBoard = (e: React.MouseEvent) => {
    Message.info("请使用快捷键的方式操作");
    e.preventDefault();
  };

  const onSelectAll = (e: React.MouseEvent) => {
    editor.canvas.mask.focus();
    editor.selection.selectAll();
    e.preventDefault();
  };

  const onLevelChange = (index: number) => {
    for (const id of active) {
      const node = editor.state.getDeltaState(id);
      if (node) {
        const z = node.getZ() + index;
        editor.state.apply(Op.from(OP_TYPE.REVISE, { id, attrs: {}, z }));
      }
    }
    editor.selection.clearActiveDeltas();
  };

  return visible ? (
    <Portal>
      <div className={styles.container} onClick={onClickProxy} style={{ top, left }}>
        {active.length !== 0 && (
          <div className={styles.item} onClick={onCopy}>
            <div>复制</div>
            <div className={styles.shortcut}>Ctrl+C</div>
          </div>
        )}
        <div className={styles.item} onClick={onClipBoard}>
          <div>粘贴</div>
          <div className={styles.shortcut}>Ctrl+V</div>
        </div>
        <div className={styles.item} onClick={onSelectAll}>
          <div>全选</div>
          <div className={styles.shortcut}>Ctrl+A</div>
        </div>
        {active.length !== 0 && (
          <React.Fragment>
            <Divider margin={3}></Divider>
            <div className={styles.item} onClick={() => onLevelChange(1)}>
              <div>上移一层</div>
            </div>
            <div className={styles.item} onClick={() => onLevelChange(-1)}>
              <div>下移一层</div>
            </div>
          </React.Fragment>
        )}
      </div>
    </Portal>
  ) : null;
};
