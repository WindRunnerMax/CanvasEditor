import { Modal } from "@arco-design/web-react";
import { IconLaunch } from "@arco-design/web-react/icon";
import type { Delta as BlockDelta } from "@block-kit/delta";
import { throttle } from "@block-kit/utils";
import type { FC } from "react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import type { DeltaState, Editor } from "sketching-core";
import { EDITOR_EVENT } from "sketching-core";
import type { RichTextLines } from "sketching-plugin";
import { TEXT_ATTRS } from "sketching-plugin";
import { TSON } from "sketching-utils";

import { NAV_ENUM } from "../../../header/utils/constant";
import styles from "../index.m.scss";
import { RichTextEditor } from "./modules/editor";
import { DEFAULT_MODAL_WIDTH, getDefaultTextDelta } from "./utils/constant";
import { sketchToTextDelta } from "./utils/transform";

export const Text: FC<{ editor: Editor; state: DeltaState }> = props => {
  const { editor, state } = props;
  const [width, setWidth] = useState(DEFAULT_MODAL_WIDTH);
  const [modalMode, setModalMode] = useState(false);
  const dataRef = useRef<BlockDelta | null>(null);

  useMemo(() => {
    const data = state.getAttr(TEXT_ATTRS.DATA);
    const blockDelta = data && TSON.parse<RichTextLines>(data);
    if (blockDelta) {
      dataRef.current = sketchToTextDelta(blockDelta);
    } else {
      dataRef.current = getDefaultTextDelta();
    }
  }, [state]);

  useEffect(() => {
    const onDoubleClick = (e: MouseEvent) => {
      if (e.detail !== 2) return void 0;
      const active = Array.from(editor.selection.getActiveDeltaIds());
      const id = active.length === 1 && active[0];
      const state = id && editor.state.getDeltaState(id);
      state && state.key === NAV_ENUM.TEXT && setModalMode(true);
    };
    editor.event.on(EDITOR_EVENT.CLICK, onDoubleClick);
    return () => {
      editor.event.off(EDITOR_EVENT.CLICK, onDoubleClick);
    };
  }, [editor.event, editor.selection, editor.state]);

  const onResizeDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startWidth = width;
    const onMouseMove = throttle((moveEvent: MouseEvent) => {
      const newWidth = startWidth + (moveEvent.clientX - startX) * 2;
      const normalized = Math.min(window.innerWidth - 100, Math.max(DEFAULT_MODAL_WIDTH, newWidth));
      setWidth(normalized);
    }, 17);
    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const TextEditor = (
    <React.Fragment key={state.id}>
      {!modalMode && (
        <div className={styles.title}>
          富文本
          <IconLaunch className={styles.launch} onClick={() => setModalMode(true)} />
        </div>
      )}
      <RichTextEditor editor={editor} state={state} dataRef={dataRef}></RichTextEditor>
      <div className={styles.resize} onMouseDown={onResizeDown}></div>
    </React.Fragment>
  );

  return modalMode ? (
    <Modal
      visible={modalMode}
      footer={null}
      focusLock={false}
      className={styles.modal}
      onCancel={() => setModalMode(false)}
      style={{ width }}
      title={<div className={styles.modalTitle}>富文本</div>}
    >
      {TextEditor}
    </Modal>
  ) : (
    TextEditor
  );
};
