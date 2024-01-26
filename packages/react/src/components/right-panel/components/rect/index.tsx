import "@arco-design/web-react/es/ColorPicker/style";

import { ColorPicker, InputNumber } from "@arco-design/web-react";
import type { FC } from "react";
import type { DeltaState, Editor } from "sketching-core";

import common from "../index.m.scss";

export const Rect: FC<{ editor: Editor; state: DeltaState }> = props => {
  return (
    <div>
      <div className={common.title}>边框</div>
      <div className={common.item}>
        <div>颜色</div>
        <ColorPicker></ColorPicker>
      </div>
      <div className={common.item}>
        <div>宽度</div>
        <InputNumber defaultValue={1} />
      </div>
    </div>
  );
};
