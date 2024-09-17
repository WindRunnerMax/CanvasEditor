import { Message, Modal } from "@arco-design/web-react";
import type { FC } from "react";
import { useMemo, useState } from "react";
import type { Editor } from "sketching-core";
import { Range } from "sketching-core";
import { DeltaSet } from "sketching-delta";
import { cs, Storage } from "sketching-utils";

import { Background } from "../../../../modules/background";
import type { TemplateConfig } from "../../../../modules/template";
import { loadTemplate, TEMPLATE_CONFIG } from "../../../../modules/template";
import type { LocalStorageData } from "../../../../utils/storage";
import { STORAGE_KEY } from "../../../../utils/storage";
import styles from "./index.m.scss";

export const Template: FC<{
  editor: Editor;
}> = ({ editor }) => {
  const [loading, setLoading] = useState(false);

  const CONFIG = useMemo(() => {
    const result: TemplateConfig[][] = [];
    TEMPLATE_CONFIG.forEach((item, index) => {
      if (index % 2 === 0) result.push([item]);
      else result[Math.floor(index / 2)].push(item);
    });
    return result;
  }, []);

  const getConfig = (item: TemplateConfig) => {
    if (!item) return void 0;
    return (
      <div className={styles.preview}>
        <div className={styles.imgContainer}>
          <img src={item.image}></img>
        </div>
        <div className={styles.name}>{item.name}</div>
      </div>
    );
  };

  const onLoadTemplate = (item: TemplateConfig) => {
    Modal.confirm({
      title: "警告",
      simple: true,
      content: <div className={styles.modalContent}>确定要加载模版吗，当前的数据将会被覆盖。</div>,
      confirmLoading: loading,
      onConfirm: async () => {
        setLoading(true);
        const res: LocalStorageData | null = await loadTemplate(item.template);
        setLoading(false);
        if (!res) return Message.error("模版加载失败");
        Storage.local.set(STORAGE_KEY, res);
        const deltaSetLike = res.deltaSetLike;
        const deltaSet = new DeltaSet(deltaSetLike);
        editor.state.setContent(deltaSet);
        Background.setRange(Range.fromRect(res.x, res.y, res.width, res.height));
        Background.render();
      },
    });
  };

  return (
    <div className={styles.container}>
      {CONFIG.map((row, rowIndex) => (
        <div className={styles.row} key={rowIndex}>
          <div className={styles.item} onClick={() => row[0] && onLoadTemplate(row[0])}>
            {getConfig(row[0])}
          </div>
          <div
            className={cs(styles.item, !row[1] && styles.hidden)}
            onClick={() => row[1] && onLoadTemplate(row[1])}
          >
            {getConfig(row[1])}
          </div>
        </div>
      ))}
    </div>
  );
};
