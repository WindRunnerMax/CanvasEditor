import type { FC } from "react";

import { useEditor } from "../../hooks/useEditor";
import styles from "./index.m.scss";

export const Header: FC = () => {
  const editor = useEditor();
  console.log("editor :>> ", editor);
  return (
    <div className={styles.container}>
      <div></div>
    </div>
  );
};
