import { forwardRef } from "react";
import { cs } from "sketching-utils";

import styles from "./index.m.scss";

export const Body = forwardRef<HTMLDivElement, { className?: string }>((props, ref) => {
  return (
    <div className={cs(styles.container, props.className)}>
      <div className={styles.canvas} ref={ref}></div>
    </div>
  );
});
