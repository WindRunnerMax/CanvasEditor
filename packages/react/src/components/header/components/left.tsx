import { useMemoizedFn } from "ahooks";
import type { FC } from "react";
import React, { useEffect, useState } from "react";
import type { Editor } from "sketching-core";
import { DRAG_KEY, EDITOR_EVENT } from "sketching-core";
import type { DeltaLike } from "sketching-delta";
import { DEFAULT_BORDER_COLOR, RECT_ATTRS } from "sketching-plugin";
import { cs, TSON } from "sketching-utils";

import { CursorIcon } from "../../../static/cursor";
import { GrabIcon } from "../../../static/grab";
import { ImageIcon } from "../../../static/image";
import { RectIcon } from "../../../static/rect";
import { TextIcon } from "../../../static/text";
import styles from "../index.m.scss";
import { NAV_ENUM } from "../utils/constant";
import { uploadImage } from "../utils/upload";

export const Left: FC<{
  editor: Editor;
}> = ({ editor }) => {
  const [active, setActive] = useState<string>(NAV_ENUM.DEFAULT);

  const switchIndex = useMemoizedFn((index: string) => {
    if (index === active) return void 0;
    editor.canvas.grab.close();
    editor.canvas.insert.close();
    if (index === NAV_ENUM.GRAB) {
      editor.canvas.grab.start();
    }
    const empty = { x: 0, y: 0, width: 0, height: 0 };
    if (index === NAV_ENUM.RECT) {
      const deltaLike: DeltaLike = {
        key: NAV_ENUM.RECT,
        ...empty,
        attrs: {
          [RECT_ATTRS.BORDER_COLOR]: DEFAULT_BORDER_COLOR,
        },
      };
      editor.canvas.insert.start(deltaLike);
    }
    if (index === NAV_ENUM.TEXT) {
      const deltaLike: DeltaLike = { key: NAV_ENUM.TEXT, ...empty };
      editor.canvas.insert.start(deltaLike);
    }
    if (index === NAV_ENUM.IMAGE) {
      uploadImage().then(src => {
        const deltaLike: DeltaLike = { key: NAV_ENUM.IMAGE, ...empty };
        deltaLike.attrs = { src };
        editor.canvas.insert.start(deltaLike);
      });
    }
    setActive(index);
  });

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
    switchIndex(NAV_ENUM.DEFAULT);
  };

  useEffect(() => {
    const onInsertState = (data: { done: boolean }) => {
      if (data.done) switchIndex(NAV_ENUM.DEFAULT);
    };
    editor.event.on(EDITOR_EVENT.INSERT_STATE, onInsertState);
    return () => {
      editor.event.off(EDITOR_EVENT.INSERT_STATE, onInsertState);
    };
  }, [editor, switchIndex]);

  return (
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
        className={cs(styles.op, active === NAV_ENUM.IMAGE && styles.active)}
        onClick={() => switchIndex(NAV_ENUM.IMAGE)}
      >
        {ImageIcon}
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
  );
};
