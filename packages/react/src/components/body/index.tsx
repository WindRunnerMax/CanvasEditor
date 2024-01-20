import { forwardRef } from "react";
import { cs } from "sketching-utils";

import { LeftPanel } from "../left-panel";
import { RightPanel } from "../right-panel";
import styles from "./index.m.scss";

export const Body = forwardRef<HTMLDivElement, { className?: string }>((props, ref) => {
  return (
    <div className={cs(styles.container, props.className)}>
      <LeftPanel></LeftPanel>
      <div className={styles.canvas} ref={ref}></div>
      <RightPanel></RightPanel>
    </div>
  );
});
