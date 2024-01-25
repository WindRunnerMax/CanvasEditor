import type { FC } from "react";
import React, { useLayoutEffect, useState } from "react";
import type { DeltaState, Editor } from "sketching-core";
import { ROOT_DELTA } from "sketching-utils";

import styles from "./index.m.scss";

export const Structure: FC<{ editor: Editor }> = ({ editor }) => {
  const [deltas, setDeltas] = useState<DeltaState[]>([]);

  useLayoutEffect(() => {
    const deltas = [...editor.state.getDeltas().values()];
    setDeltas(deltas.filter(delta => delta.id !== ROOT_DELTA));
  }, [editor]);

  return (
    <div className={styles.container}>
      {Object.values(deltas).map(node => (
        <div key={node.id}>{node.id}</div>
      ))}
    </div>
  );
};
