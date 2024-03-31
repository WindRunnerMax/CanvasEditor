import { Message } from "@arco-design/web-react";
import type { FC } from "react";
import React, { useEffect, useState } from "react";
import { EDITOR_EVENT } from "sketching-core";

import { useEditor } from "../../hooks/use-editor";
import styles from "./index.m.scss";
import { Portal } from "./portal";

export const ContextMenu: FC = () => {
  const [top, setTop] = useState(0);
  const [left, setLeft] = useState(0);
  const [visible, setVisible] = useState(false);
  const { editor } = useEditor();

  useEffect(() => {
    const onEnableVisible = (e: MouseEvent) => {
      setVisible(true);
      setTop(e.clientY);
      setLeft(e.clientX);
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
  }, [editor.event]);

  const onClickProxy = (e: React.MouseEvent) => {
    setVisible(false);
    e.stopPropagation();
    e.preventDefault();
  };

  const onPaste = (e: React.MouseEvent) => {
    Message.info("请使用快捷键的方式粘贴");
    e.preventDefault();
  };

  const onSelectAll = (e: React.MouseEvent) => {
    editor.selection.selectAll();
    e.preventDefault();
  };

  return visible ? (
    <Portal>
      <div className={styles.container} onClick={onClickProxy} style={{ top, left }}>
        <div className={styles.item} onClick={onPaste}>
          <div>粘贴</div>
          <div className={styles.shortcut}>Ctrl+V</div>
        </div>
        <div className={styles.item} onClick={onSelectAll}>
          <div>全选</div>
          <div className={styles.shortcut}>Ctrl+A</div>
        </div>
      </div>
    </Portal>
  ) : null;
};
