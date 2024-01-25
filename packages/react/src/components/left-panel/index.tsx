import { Tabs } from "@arco-design/web-react";
import type { FC } from "react";

import { useEditor } from "../../hooks/use-editor";
import { Structure } from "./components/structure";
import styles from "./index.m.scss";
const TabPane = Tabs.TabPane;

export const LeftPanel: FC = () => {
  const { editor } = useEditor();

  return (
    <div className={styles.container}>
      <Tabs destroyOnHide>
        <TabPane key="template" title="模版"></TabPane>
        <TabPane key="structure" title="结构">
          <Structure editor={editor}></Structure>
        </TabPane>
      </Tabs>
    </div>
  );
};
