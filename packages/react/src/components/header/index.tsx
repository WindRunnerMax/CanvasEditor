import type { FC } from "react";
import { useEffect, useState } from "react";
import { DRAG_KEY, EDITOR_EVENT } from "sketching-core";
import type { DeltaLike } from "sketching-delta";
import { cs, TSON } from "sketching-utils";

import { useEditor } from "../../hooks/useEditor";
import { CursorIcon } from "../../static/cursor";
import { GrabIcon } from "../../static/grab";
import { RectIcon } from "../../static/rect";
import { TextIcon } from "../../static/text";
import styles from "./index.m.scss";
import { NAV_ENUM } from "./types";

export const Header: FC = () => {
  const { editor } = useEditor();
  const [active, setActive] = useState(NAV_ENUM.DEFAULT);

  const switchIndex = (index: string) => {
    if (index === active) return void 0;
    if (index === NAV_ENUM.DEFAULT) {
      editor.canvas.insert.close();
      editor.canvas.grab.close();
    }
    if (index === NAV_ENUM.GRAB) {
      editor.canvas.grab.start();
    }
    const empty = { x: 0, y: 0, width: 0, height: 0 };
    if (index === NAV_ENUM.RECT) {
      const deltaLike: DeltaLike = { key: NAV_ENUM.RECT, ...empty };
      editor.canvas.insert.start(deltaLike);
    }
    if (index === NAV_ENUM.TEXT) {
      const deltaLike: DeltaLike = { key: NAV_ENUM.TEXT, ...empty };
      editor.canvas.insert.start(deltaLike);
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

  const onDragText = (e: React.DragEvent<HTMLDivElement>) => {
    if (active !== NAV_ENUM.DEFAULT) return false;
    const deltaLike: DeltaLike = {
      key: NAV_ENUM.TEXT,
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

  useEffect(() => {
    const onInsertState = (data: { done: boolean }) => {
      if (data.done) setActive(NAV_ENUM.DEFAULT);
    };
    editor.event.on(EDITOR_EVENT.INSERT_STATE, onInsertState);
    return () => {
      editor.event.off(EDITOR_EVENT.INSERT_STATE, onInsertState);
    };
  }, [editor]);

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
          onDragStart={onDragRect}
          onDragEnd={onDragEnd}
          className={cs(styles.op, active === NAV_ENUM.RECT && styles.active)}
          onClick={() => switchIndex(NAV_ENUM.RECT)}
        >
          {RectIcon}
        </div>
        <div
          draggable={active === NAV_ENUM.DEFAULT}
          onDragStart={onDragText}
          onDragEnd={onDragEnd}
          className={cs(styles.op, active === NAV_ENUM.TEXT && styles.active)}
          onClick={() => switchIndex(NAV_ENUM.TEXT)}
        >
          {TextIcon}
        </div>
      </div>
    </div>
  );
};
