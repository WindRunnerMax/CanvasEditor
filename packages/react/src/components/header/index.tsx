import type { FC } from "react";
import { useState } from "react";
import { DRAG_KEY } from "sketching-core";
import type { DeltaLike } from "sketching-delta";
import { cs, TSON } from "sketching-utils";

import { useEditor } from "../../hooks/useEditor";
import { CursorIcon } from "../../static/cursor";
import { GrabIcon } from "../../static/grab";
import { RectIcon } from "../../static/rect";
import styles from "./index.m.scss";
import { NAV_ENUM } from "./types";

export const Header: FC = () => {
  const { editor } = useEditor();
  const [active, setActive] = useState(NAV_ENUM.DEFAULT);

  const switchIndex = (index: string) => {
    if (index === active) return void 0;
    if (index === NAV_ENUM.GRAB) {
      editor.canvas.grab.start();
    } else {
      editor.canvas.grab.close();
    }
    setActive(index);
  };

  const onDragRect = (e: React.DragEvent<HTMLDivElement>) => {
    if (active !== NAV_ENUM.DEFAULT) return false;
    const deltaLike: DeltaLike = {
      key: NAV_ENUM.RECT,
      x: 0,
      y: 0,
      width: 100,
      height: 50,
    };
    e.dataTransfer.setData(DRAG_KEY, TSON.encode(deltaLike) || "");
  };

  const onDragEnd = () => {
    setActive(NAV_ENUM.DEFAULT);
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
          draggable={active === NAV_ENUM.DEFAULT}
          onDragStart={e => onDragRect(e)}
          onDragEnd={onDragEnd}
          className={cs(styles.op, active === NAV_ENUM.RECT && styles.active)}
          onClick={() => switchIndex(NAV_ENUM.RECT)}
        >
          {RectIcon}
        </div>
      </div>
    </div>
  );
};
