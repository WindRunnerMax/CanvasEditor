import { Modal } from "@arco-design/web-react";
import { IconLaunch } from "@arco-design/web-react/icon";
import type { Delta as BlockDelta } from "@block-kit/delta";
import type { FC } from "react";
import React, { useMemo, useRef, useState } from "react";
import type { DeltaState } from "sketching-core";
import type { Editor } from "sketching-core";
import type { RichTextLines } from "sketching-plugin";
import { TEXT_ATTRS } from "sketching-plugin";
import { TSON } from "sketching-utils";

import styles from "../index.m.scss";
import { RichTextEditor } from "./modules/editor";
import { getDefaultTextDelta } from "./utils/constant";
import { sketchToTextDelta } from "./utils/transform";

export const Text: FC<{ editor: Editor; state: DeltaState }> = ({ editor, state }) => {
  const [visible, setVisible] = useState(false);
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

  const TextEditor = (
    <React.Fragment key={state.id}>
      {!visible && (
        <div className={styles.title}>
          富文本
          <IconLaunch className={styles.launch} onClick={() => setVisible(true)} />
        </div>
      )}
      <RichTextEditor editor={editor} state={state} dataRef={dataRef}></RichTextEditor>
    </React.Fragment>
  );

  return visible ? (
    <Modal
      visible={visible}
      footer={null}
      focusLock={false}
      className={styles.modal}
      onCancel={() => setVisible(false)}
      title={<div className={styles.modalTitle}>富文本</div>}
    >
      {TextEditor}
    </Modal>
  ) : (
    TextEditor
  );
};
