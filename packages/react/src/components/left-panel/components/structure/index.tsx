import type { FC } from "react";
import React, { useEffect, useState } from "react";
import type { DeltaState, Editor } from "sketching-core";
import { EDITOR_EVENT } from "sketching-core";
import { cs, ROOT_DELTA } from "sketching-utils";

import { ICON_ENUM } from "../../utils/constant";
import styles from "./index.m.scss";

export const Structure: FC<{ editor: Editor }> = ({ editor }) => {
  const [active, setActive] = useState(new Set());
  const [deltas, setDeltas] = useState<DeltaState[]>([]);

  useEffect(() => {
    const onContentChange = () => {
      const deltas = [...editor.state.getDeltas().values()];
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

  return (
    <div className={styles.container}>
      {Object.values(deltas).map(node => (
        <div
          key={node.id}
          className={cs(styles.item, active.has(node.id) && styles.active)}
          onClick={() => onSelectNode(node.id)}
        >
          {ICON_ENUM[node.key]}
          {node.id}
        </div>
      ))}
    </div>
  );
};
