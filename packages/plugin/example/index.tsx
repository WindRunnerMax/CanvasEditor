import "./styles/global.scss";
import "@arco-design/web-react/es/style/index.less";

import type { FC } from "react";
import { useLayoutEffect, useMemo, useRef } from "react";
import ReactDOM from "react-dom";
import { Editor, LOG_LEVEL } from "sketching-core";
import { DeltaSet } from "sketching-delta";

import { Rect } from "../src/rect";
import { Body } from "./components/body";
import { Header } from "./components/header";
import { WithEditor } from "./hooks/useEditor";
import { EXAMPLE } from "./utils/constant";

DeltaSet.register(Rect);

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
    window.editor = editor;
    return () => {
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
