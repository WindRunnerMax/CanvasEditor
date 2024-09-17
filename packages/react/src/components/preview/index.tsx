import type { FC } from "react";
import { useLayoutEffect, useMemo, useRef } from "react";
import { Editor, LOG_LEVEL, Range } from "sketching-core";
import { DeltaSet } from "sketching-delta";
import { Storage } from "sketching-utils";

import { WithEditor } from "../../hooks/use-editor";
import { Background } from "../../modules/background";
import type { LocalStorageData } from "../../utils/storage";
import { EXAMPLE, STORAGE_KEY } from "../../utils/storage";
import { Body } from "./components/body";

export const Preview: FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const editor = useMemo(() => {
    const data = Storage.local.get<LocalStorageData>(STORAGE_KEY) || EXAMPLE;
    const deltaSetLike = data && data.deltaSetLike;
    Background.setRange(Range.fromRect(data.x, data.y, data.width, data.height));
    return new Editor({
      deltaSet: new DeltaSet(deltaSetLike),
      logLevel: LOG_LEVEL.INFO,
      readonly: true,
    });
  }, []);

  useLayoutEffect(() => {
    window.editor = editor;
    const el = ref.current;
    el && editor.onMount(el);
    window.editor = editor;
    editor.canvas.grab.setState(false);
    const { x, y } = Background.rect;
    editor.canvas.setOffset(x, y);
    return () => {
      editor.destroy();
    };
  }, [editor]);

  return (
    <WithEditor editor={editor}>
      <Body ref={ref} editor={editor}></Body>
    </WithEditor>
  );
};
