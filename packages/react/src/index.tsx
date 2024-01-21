import "./styles/global.scss";
import "@arco-design/web-react/es/style/index.less";

import type { FC } from "react";
import { useLayoutEffect, useMemo, useRef } from "react";
import ReactDOM from "react-dom";
import { Editor, LOG_LEVEL } from "sketching-core";
import { DeltaSet } from "sketching-delta";
import { Rect, Text } from "sketching-plugin";

import { Body } from "./components/body";
import { Header } from "./components/header";
import { WithEditor } from "./hooks/use-editor";
import { Background } from "./modules/background";
import { EXAMPLE } from "./utils/constant";

DeltaSet.register(Rect);
DeltaSet.register(Text);

const App: FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const editor = useMemo(
    () => new Editor({ deltaSet: new DeltaSet(EXAMPLE), logLevel: LOG_LEVEL.INFO }),
    []
  );

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

  return (
    <WithEditor editor={editor}>
      <Header></Header>
      <Body ref={ref}></Body>
    </WithEditor>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
