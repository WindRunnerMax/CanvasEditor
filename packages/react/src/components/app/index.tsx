import type { FC } from "react";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import type { ContentChangeEvent } from "sketching-core";
import { Editor, EDITOR_EVENT, LOG_LEVEL, Range } from "sketching-core";
import { DeltaSet } from "sketching-delta";
import { Storage } from "sketching-utils";

import { WithEditor } from "../../hooks/use-editor";
import { Background } from "../../modules/background";
import type { LocalStorageData } from "../../utils/storage";
import { EXAMPLE, STORAGE_KEY } from "../../utils/storage";
import { Body } from "../body";
import { ContextMenu } from "../context-menu";
import { Header } from "../header";

// COMPAT: 避免升级的不兼容问题
Storage.setSuffix("");

export const App: FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const editor = useMemo(() => {
    const data = Storage.local.get<LocalStorageData>(STORAGE_KEY) || EXAMPLE;
    Background.setRange(Range.fromRect(data.x, data.y, data.width, data.height));
    const deltaSetLike = data && data.deltaSetLike;
    return new Editor({
      deltaSet: new DeltaSet(deltaSetLike),
      logLevel: LOG_LEVEL.INFO,
    });
  }, []);

  useLayoutEffect(() => {
    window.editor = editor;
    const el = ref.current;
    el && editor.onMount(el);
    Background.init(editor);
    window.editor = editor;
    return () => {
      Background.destroy(editor);
      editor.destroy();
    };
  }, [editor]);

  useEffect(() => {
    const onContentChange = (e: ContentChangeEvent) => {
      const deltaSetLike = e.current.getDeltas();
      const storageData: LocalStorageData = { ...Background.rect, deltaSetLike };
      Storage.local.set(STORAGE_KEY, storageData);
    };
    editor.event.on(EDITOR_EVENT.CONTENT_CHANGE, onContentChange);
    return () => {
      editor.event.off(EDITOR_EVENT.CONTENT_CHANGE, onContentChange);
    };
  }, [editor]);

  return (
    <WithEditor editor={editor}>
      <Header></Header>
      <Body ref={ref}></Body>
      <ContextMenu></ContextMenu>
    </WithEditor>
  );
};
