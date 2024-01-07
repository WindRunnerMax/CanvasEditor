import type { FC } from "react";

import { useEditor } from "../../hooks/useEditor";
import { CursorIcon } from "../../static/cursor";
import { GrabIcon } from "../../static/grab";
import styles from "./index.m.scss";

export const Header: FC = () => {
  const editor = useEditor();
  console.log("editor :>> ", editor);
  return (
    <div className={styles.container}>
      <div className={styles.opGroup}>
        <div className={styles.op}>{CursorIcon}</div>
        <div className={styles.op}>{GrabIcon}</div>
      </div>
    </div>
  );
};
