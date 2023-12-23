import type { FC } from "react";
import { useLayoutEffect, useMemo, useRef } from "react";
import { Editor, LOG_LEVEL } from "sketching-core";
import { DeltaSet } from "sketching-delta";

import { EXAMPLE } from "../../utils/constant";
import styles from "./index.m.scss";

export const App: FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const editor = useMemo(
    () => new Editor({ deltaSet: new DeltaSet(EXAMPLE), logLevel: LOG_LEVEL.INFO }),
    []
  );

  useLayoutEffect(() => {
    window.editor = editor;
    const el = ref.current;
    el && editor.onMount(el);
    return () => {
      editor.destroy();
    };
  }, [editor]);

  return (
    <div className={styles.container}>
      <div className={styles.canvas} ref={ref}></div>
    </div>
  );
};
