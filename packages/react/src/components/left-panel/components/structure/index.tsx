import { IconClose } from "@arco-design/web-react/icon";
import type { FC } from "react";
import React, { useEffect, useState } from "react";
import type { DeltaState, Editor } from "sketching-core";
import { EDITOR_EVENT } from "sketching-core";
import { Op, OP_TYPE } from "sketching-delta";
import { cs, ROOT_DELTA } from "sketching-utils";

import { ICON_ENUM } from "../../utils/constant";
import styles from "./index.m.scss";

export const Structure: FC<{ editor: Editor }> = ({ editor }) => {
  const [active, setActive] = useState(new Set());
  const [deltas, setDeltas] = useState<DeltaState[]>([]);

  useEffect(() => {
    const onContentChange = () => {
      const deltas = [...editor.state.getDeltasMap().values()];
      setDeltas(deltas.filter(delta => delta.id !== ROOT_DELTA));
    };
    const onSelectionChange = () => {
      setActive(new Set([...editor.selection.getActiveDeltaIds()]));
    };
    onContentChange();
    onSelectionChange();
    editor.event.on(EDITOR_EVENT.CONTENT_CHANGE, onContentChange);
    editor.event.on(EDITOR_EVENT.SELECTION_CHANGE, onSelectionChange);
    return () => {
      editor.event.off(EDITOR_EVENT.CONTENT_CHANGE, onContentChange);
      editor.event.off(EDITOR_EVENT.SELECTION_CHANGE, onSelectionChange);
    };
  }, [editor]);

  const onSelectNode = (id: string) => {
    editor.selection.setActiveDelta(id);
  };

  const onDeleteNode = (id: string) => {
    const parentId = editor.state.getDeltaStateParentId(id);
    editor.state.apply(Op.from(OP_TYPE.DELETE, { id, parentId }));
  };

  return (
    <div className={styles.container}>
      {Object.values(deltas).map(node => (
        <div key={node.id} className={cs(styles.item, active.has(node.id) && styles.active)}>
          <div className={styles.title} onClick={() => onSelectNode(node.id)}>
            <div className={styles.icon}>{ICON_ENUM[node.key]}</div>
            <div>{node.id}</div>
          </div>
          <div className={styles.op} onClick={() => onDeleteNode(node.id)}>
            <IconClose />
          </div>
        </div>
      ))}
    </div>
  );
};
