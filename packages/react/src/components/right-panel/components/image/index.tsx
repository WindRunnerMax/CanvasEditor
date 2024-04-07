import "@arco-design/web-react/es/Select/style";

import { ColorPicker, InputNumber, Radio } from "@arco-design/web-react";
import type { FC } from "react";
import React from "react";
import type { DeltaState, Editor } from "sketching-core";
import { Op, OP_TYPE } from "sketching-delta";
import { DEFAULT_BORDER_COLOR, IMAGE_ATTRS, IMAGE_MODE, RECT_ATTRS } from "sketching-plugin";

import { useIsMounted } from "../../../../hooks/is-mounted";
import { uploadImage } from "../../../header/utils/upload";
import styles from "../index.m.scss";
const RadioGroup = Radio.Group;
export const Image: FC<{ editor: Editor; state: DeltaState }> = ({ editor, state }) => {
  const { isMounted } = useIsMounted();

  const onChange = (key: string, value: string | null) => {
    // COMPAT: 避免初始化时即触发`onChange`
    if (!isMounted() || state.getAttr(key) === value) return void 0;
    editor.state.apply(new Op(OP_TYPE.REVISE, { id: state.id, attrs: { [key]: value } }));
  };

  const onPickImage = () => {
    uploadImage().then(src => {
      onChange(IMAGE_ATTRS.SRC, src);
    });
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
          min={0}
          max={10}
          size="mini"
          onChange={v => onChange(RECT_ATTRS.BORDER_WIDTH, v.toString())}
          defaultValue={state.getAttr(RECT_ATTRS.BORDER_WIDTH) || 0}
        />
      </div>
      <div className={styles.title}>图像</div>
      <div className={styles.item}>
        <div>图片</div>
        <div className={styles.uploadImage} onClick={onPickImage}>
          选择
        </div>
      </div>
      <div className={styles.item}>
        <div>模式</div>
        <RadioGroup
          className={styles.radioGroup}
          direction="vertical"
          defaultValue={state.getAttr(IMAGE_ATTRS.MODE) || IMAGE_MODE.FILL}
          onChange={v => onChange(IMAGE_ATTRS.MODE, v)}
        >
          <Radio value={IMAGE_MODE.FILL}>{IMAGE_MODE.FILL}</Radio>
          <Radio value={IMAGE_MODE.COVER}>{IMAGE_MODE.COVER}</Radio>
          <Radio value={IMAGE_MODE.CONTAIN}>{IMAGE_MODE.CONTAIN}</Radio>
        </RadioGroup>
      </div>
    </React.Fragment>
  );
};
