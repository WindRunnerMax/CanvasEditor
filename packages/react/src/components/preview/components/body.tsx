import React, { forwardRef } from "react";
import type { Editor } from "sketching-core";
import { cs } from "sketching-utils";

import { Background } from "../../../modules/background";
import styles from "./index.m.scss";

export const Body = forwardRef<HTMLDivElement, { editor: Editor }>((_, ref) => {
  const { width, height } = Background.rect;
  return (
    <div className={cs(styles.container)}>
      <div className={styles.canvas} ref={ref} style={{ width, height }}></div>
    </div>
  );
});
