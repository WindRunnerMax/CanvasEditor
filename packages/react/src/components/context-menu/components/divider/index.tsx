import type { FC } from "react";

import styles from "./index.m.scss";

export const Divider: FC<{
  margin?: number;
  style?: React.CSSProperties;
}> = props => {
  return (
    <div
      className={styles.divider}
      style={{ marginTop: props.margin, marginBottom: props.margin, ...props.style }}
    ></div>
  );
};
