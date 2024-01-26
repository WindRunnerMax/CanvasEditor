// COMPAT: https://github.com/arco-design/arco-design/pull/2520
import "@arco-design/web-react/es/Select/style";

import { ColorPicker, InputNumber } from "@arco-design/web-react";
import type { FC } from "react";
import type { DeltaState, Editor } from "sketching-core";
import { Op, OP_TYPE } from "sketching-delta";
import {
  DEFAULT_BORDER_COLOR,
  DEFAULT_BORDER_WIDTH,
  DEFAULT_FILL_COLOR,
  RECT_ATTRS,
} from "sketching-plugin";

import styles from "../index.m.scss";

export const Rect: FC<{ editor: Editor; state: DeltaState }> = ({ editor, state }) => {
  const onChange = (key: string, value: string) => {
    editor.state.apply(new Op(OP_TYPE.REVISE, { id: state.id, attrs: { [key]: value } }));
  };

  return (
    <div>
      <div className={styles.title}>边框</div>
      <div className={styles.item}>
        <div>颜色</div>
        <ColorPicker
          size="mini"
          onChange={v => onChange(RECT_ATTRS.BORDER_COLOR, v)}
          defaultValue={state.getAttr(RECT_ATTRS.BORDER_COLOR) || DEFAULT_BORDER_COLOR}
        ></ColorPicker>
      </div>
      <div className={styles.item}>
        <div>宽度</div>
        <InputNumber
          className={styles.input}
          size="mini"
          onChange={v => onChange(RECT_ATTRS.BORDER_WIDTH, v.toString())}
          defaultValue={state.getAttr(RECT_ATTRS.BORDER_WIDTH) || DEFAULT_BORDER_WIDTH}
        />
      </div>
      <div className={styles.title}>背景</div>
      <div className={styles.item}>
        <div>颜色</div>
        <ColorPicker
          size="mini"
          onChange={v => onChange(RECT_ATTRS.FILL_COLOR, v)}
          defaultValue={state.getAttr(RECT_ATTRS.FILL_COLOR) || DEFAULT_FILL_COLOR}
        ></ColorPicker>
      </div>
    </div>
  );
};
