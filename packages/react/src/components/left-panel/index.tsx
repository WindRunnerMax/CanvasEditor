import { Tabs } from "@arco-design/web-react";
import type { FC } from "react";

import styles from "./index.m.scss";
const TabPane = Tabs.TabPane;

export const LeftPanel: FC = () => {
  return (
    <div className={styles.container}>
      <Tabs destroyOnHide>
        <TabPane key="tab1" title="模版"></TabPane>
        <TabPane key="tab2" title="结构"></TabPane>
      </Tabs>
    </div>
  );
};
