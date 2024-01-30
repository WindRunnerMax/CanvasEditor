import { IconPlus } from "@arco-design/web-react/icon";
import type { FC } from "react";
import { useEffect, useMemo, useState } from "react";
import type { RangeRect, SelectionChangeEvent } from "sketching-core";
import { EDITOR_EVENT } from "sketching-core";
import { cs } from "sketching-utils";

import { useEditor } from "../../hooks/use-editor";
import { Background } from "../../modules/background";
import { NAV_ENUM } from "../header/utils/constant";
import { Image } from "./components/image";
import { Rect } from "./components/rect";
import { Text } from "./components/text";
import styles from "./index.m.scss";

export const RightPanel: FC = () => {
  const { editor } = useEditor();
  const [collapse, setCollapse] = useState(false);
  const [active, setActive] = useState<string[]>([]);
  const [range, setRange] = useState<RangeRect | null>(null);

  useEffect(() => {
    const onSelect = (e: SelectionChangeEvent) => {
      setRange(e.current ? e.current.rect() : null);
      setActive([...editor.selection.getActiveDeltaIds()]);
    };
    editor.event.on(EDITOR_EVENT.SELECTION_CHANGE, onSelect);
    return () => {
      editor.event.off(EDITOR_EVENT.SELECTION_CHANGE, onSelect);
    };
  }, [editor]);

  const loadEditor = () => {
    const id = active.length === 1 && active[0];
    if (!id) return null;
    const state = editor.state.getDeltaState(id);
    if (!state) return null;
    switch (state.key) {
      case NAV_ENUM.RECT:
        return <Rect key={id} editor={editor} state={state}></Rect>;
      case NAV_ENUM.TEXT:
        return <Text key={id} editor={editor} state={state}></Text>;
      case NAV_ENUM.IMAGE:
        return <Image key={id} editor={editor} state={state}></Image>;
      default:
        return null;
    }
  };

  const rect = useMemo(() => {
    if (!range) return null;
    const offset = Background.rect;
    const { x, y, width, height } = range;
    const lt = { x: x - offset.x, y: y - offset.y };
    const rt = { x: x + width - offset.x, y: y - offset.y };
    const lb = { x: x - offset.x, y: y + height - offset.y };
    const rb = { x: x + width - offset.x, y: y + height - offset.y };
    const format = (num: number) => Math.round(num * 10) / 10;
    const toPos = (pos: { x: number; y: number }) => `[${format(pos.x)},${format(pos.y)}]`;
    return { lt: toPos(lt), rt: toPos(rt), lb: toPos(lb), rb: toPos(rb) };
  }, [range]);

  return (
    <div className={cs(styles.container, collapse && styles.collapse)}>
      <div className={cs(styles.op)} onClick={() => setCollapse(!collapse)}>
        <IconPlus />
      </div>
      <div className={styles.scroll}>
        {rect && (
          <div className={styles.rect}>
            <div className={styles.content}></div>
            <div className={cs(styles.pos, styles.lt)}>{rect.lt}</div>
            <div className={cs(styles.pos, styles.rt)}>{rect.rt}</div>
            <div className={cs(styles.pos, styles.lb)}>{rect.lb}</div>
            <div className={cs(styles.pos, styles.rb)}>{rect.rb}</div>
          </div>
        )}
        {active.length === 0 && "请选择图形"}
        {active.length === 1 && loadEditor()}
      </div>
    </div>
  );
};
