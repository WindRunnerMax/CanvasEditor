// COMPAT: https://github.com/arco-design/arco-design/pull/2520
import "@arco-design/web-react/es/Select/style";

import { Checkbox, ColorPicker, InputNumber } from "@arco-design/web-react";
import type { FC } from "react";
import React from "react";
import type { DeltaState, Editor } from "sketching-core";
import { Op, OP_TYPE } from "sketching-delta";
import {
  DEFAULT_BORDER_COLOR,
  DEFAULT_BORDER_WIDTH,
  DEFAULT_FILL_COLOR,
  FALSY,
  isTruly,
  RECT_ATTRS,
  TRULY,
} from "sketching-plugin";

import { useIsMounted } from "../../../../hooks/is-mounted";
import styles from "../index.m.scss";

export const Rect: FC<{ editor: Editor; state: DeltaState }> = ({ editor, state }) => {
  const { isMounted } = useIsMounted();

  const onChange = (key: string, value: string | null) => {
    // COMPAT: 避免初始化时即触发`onChange`
    if (!isMounted() || state.getAttr(key) === value) return void 0;
    editor.state.apply(new Op(OP_TYPE.REVISE, { id: state.id, attrs: { [key]: value } }));
  };

  return (
    <React.Fragment>
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
          min={1}
          max={10}
          size="mini"
          onChange={v => onChange(RECT_ATTRS.BORDER_WIDTH, v.toString())}
          defaultValue={state.getAttr(RECT_ATTRS.BORDER_WIDTH) || DEFAULT_BORDER_WIDTH}
        />
      </div>
      <div className={styles.item}>
        <div>状态</div>
        <div>
          <Checkbox
            defaultChecked={isTruly(state.getAttr(RECT_ATTRS.T))}
            onChange={v => onChange(RECT_ATTRS.T, v ? TRULY : FALSY)}
          >
            T
          </Checkbox>
          <Checkbox
            defaultChecked={isTruly(state.getAttr(RECT_ATTRS.L))}
            onChange={v => onChange(RECT_ATTRS.L, v ? TRULY : FALSY)}
          >
            L
          </Checkbox>
          <Checkbox
            defaultChecked={isTruly(state.getAttr(RECT_ATTRS.R))}
            onChange={v => onChange(RECT_ATTRS.R, v ? TRULY : FALSY)}
          >
            R
          </Checkbox>
          <Checkbox
            defaultChecked={isTruly(state.getAttr(RECT_ATTRS.B))}
            onChange={v => onChange(RECT_ATTRS.B, v ? TRULY : FALSY)}
          >
            B
          </Checkbox>
        </div>
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
    </React.Fragment>
  );
};
