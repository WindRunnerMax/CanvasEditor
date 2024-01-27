import "./styles/global.scss";
import "@arco-design/web-react/es/style/index.less";

import type { FC } from "react";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import ReactDOM from "react-dom";
import type { ContentChangeEvent } from "sketching-core";
import { Editor, EDITOR_EVENT, LOG_LEVEL } from "sketching-core";
import type { DeltaSetLike } from "sketching-delta";
import { DeltaSet } from "sketching-delta";
import { Image, Rect, Text } from "sketching-plugin";
import { storage } from "sketching-utils";

import { Body } from "./components/body";
import { Header } from "./components/header";
import { WithEditor } from "./hooks/use-editor";
import { Background } from "./modules/background";
import { EXAMPLE, STORAGE_KEY } from "./utils/constant";

DeltaSet.register(Rect);
DeltaSet.register(Text);
DeltaSet.register(Image);

const App: FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const editor = useMemo(() => {
    const data = storage.local.get<DeltaSetLike>(STORAGE_KEY);
    return new Editor({ deltaSet: new DeltaSet(data || EXAMPLE), logLevel: LOG_LEVEL.INFO });
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
      storage.local.set(STORAGE_KEY, e.current.getDeltas());
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
    </WithEditor>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
