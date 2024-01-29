import type { FC } from "react";

import { useEditor } from "../../hooks/use-editor";
import { Left } from "./components/left";
import { Right } from "./components/right";
import styles from "./index.m.scss";

export const Header: FC = () => {
  const { editor } = useEditor();

  return (
    <div className={styles.container}>
      <Left editor={editor} />
      <Right editor={editor} />
    </div>
  );
};
