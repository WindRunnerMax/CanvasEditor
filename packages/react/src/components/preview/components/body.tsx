import React, { forwardRef, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import type { Editor } from "sketching-core";
import { EDITOR_EVENT } from "sketching-core";
import { cs } from "sketching-utils";

import { Background } from "../../../modules/background";
import styles from "./index.m.scss";
import { Links } from "./link";

export const Body = forwardRef<HTMLDivElement, { editor: Editor }>((props, ref) => {
  const linkRef = useRef<HTMLDivElement>(null);
  const { width, height } = Background.rect;

  useEffect(() => {
    const onPaint = () => {
      const linkDOM = linkRef.current;
      if (linkDOM) {
        ReactDOM.render(<Links editor={props.editor} />, linkDOM);
      }
    };
    props.editor.event.once(EDITOR_EVENT.PAINT, onPaint);
  }, [props.editor]);

  return (
    <div className={cs(styles.container)}>
      <div className={styles.canvas} ref={ref} style={{ width, height }}></div>
      <div ref={linkRef}></div>
    </div>
  );
});
