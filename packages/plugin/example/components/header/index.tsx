import type { FC } from "react";
import { useState } from "react";
import { cs } from "sketching-utils";

import { useEditor } from "../../hooks/useEditor";
import { CursorIcon } from "../../static/cursor";
import { GrabIcon } from "../../static/grab";
import { RectIcon } from "../../static/rect";
import styles from "./index.m.scss";
import { NAV_ENUM } from "./types";

export const Header: FC = () => {
  const { editor } = useEditor();
  const [active, setActive] = useState(NAV_ENUM.DEFAULT);

  const switchIndex = (index: number) => {
    if (index === active) return void 0;
    if (index === NAV_ENUM.GRAB) {
      editor.canvas.grab.start();
    } else {
      editor.canvas.grab.close();
    }
    setActive(index);
  };

  return (
    <div className={styles.container}>
      <div className={styles.opGroup}>
        <div
          className={cs(styles.op, active === NAV_ENUM.DEFAULT && styles.active)}
          onClick={() => switchIndex(NAV_ENUM.DEFAULT)}
        >
          {CursorIcon}
        </div>
        <div
          className={cs(styles.op, active === NAV_ENUM.GRAB && styles.active)}
          onClick={() => switchIndex(NAV_ENUM.GRAB)}
        >
          {GrabIcon}
        </div>
        <div
          draggable
          className={cs(styles.op, active === NAV_ENUM.RECT && styles.active)}
          onClick={() => switchIndex(NAV_ENUM.RECT)}
        >
          {RectIcon}
        </div>
      </div>
    </div>
  );
};
