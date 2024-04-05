import "doc-editor-plugin/dist/styles/index";

import { Modal } from "@arco-design/web-react";
import { IconLaunch } from "@arco-design/web-react/icon";
import { useMemoizedFn } from "ahooks";
import { Editable, useMakeEditor } from "doc-editor-core";
import type { BaseNode, BlockElement } from "doc-editor-delta";
import {
  BoldPlugin,
  FontBasePlugin,
  HeadingPlugin,
  HyperLinkPlugin,
  InlineCodePlugin,
  ItalicPlugin,
  LineHeightPlugin,
  MenuToolBar,
  OrderedListPlugin,
  ParagraphPlugin,
  QuoteBlockPlugin,
  ShortCutPlugin,
  StrikeThroughPlugin,
  UnderLinePlugin,
  UnorderedListPlugin,
} from "doc-editor-plugin";
import type { FC } from "react";
import React, { useMemo, useRef, useState } from "react";
import type { DeltaState, Editor } from "sketching-core";
import type { DeltaAttributes } from "sketching-delta";
import { Op, OP_TYPE } from "sketching-delta";
import { TEXT_ATTRS } from "sketching-plugin";
import { debounce, TSON } from "sketching-utils";

import { useIsMounted } from "../../../../hooks/is-mounted";
import styles from "../index.m.scss";
import { schema } from "./config/schema";
import { DividingLinePlugin } from "./plugins/dividing-line";
import { blocksToLines } from "./slate-kit";

export const Text: FC<{ editor: Editor; state: DeltaState }> = ({ editor, state }) => {
  const { isMounted } = useIsMounted();
  const [visible, setVisible] = useState(false);
  const dataRef = useRef<BlockElement[]>([]);

  useMemo(() => {
    const data = state.getAttr(TEXT_ATTRS.ORIGIN_DATA);
    const blocks = data && TSON.parse<BlockElement[]>(data);
    if (blocks) dataRef.current = blocks;
    else dataRef.current = [{ children: [{ text: "" }] }] as BlockElement[];
  }, [state]);

  const richText = useMakeEditor(schema, dataRef.current);
  useMemo(() => {
    richText.plugin.register(
      ParagraphPlugin(),
      HeadingPlugin(richText),
      BoldPlugin(),
      QuoteBlockPlugin(richText),
      HyperLinkPlugin(richText, false),
      UnderLinePlugin(),
      StrikeThroughPlugin(),
      ItalicPlugin(),
      InlineCodePlugin(),
      OrderedListPlugin(richText),
      UnorderedListPlugin(richText),
      DividingLinePlugin(),
      FontBasePlugin(),
      LineHeightPlugin(),
      ShortCutPlugin(richText)
    );
  }, [richText]);

  const onChange = useMemoizedFn((attrs: DeltaAttributes) => {
    // COMPAT: 避免初始化时即触发`onChange`
    if (!isMounted()) return void 0;
    let allEqual = true;
    for (const [key, value] of Object.entries(attrs)) {
      if (state.getAttr(key) !== value) {
        allEqual = false;
        break;
      }
    }
    if (allEqual) return void 0;
    editor.state.apply(new Op(OP_TYPE.REVISE, { id: state.id, attrs }));
  });

  const updateText = useMemo(
    () =>
      debounce((text: BaseNode[]) => {
        dataRef.current = text as BlockElement[];
        // fix: 切换面板会重建`Editable`需要更新初始值
        richText.init = dataRef.current;
        // 双写-空间换时间
        // @ts-expect-error BlockElement
        if (text.length === 1 && text[0].children.length === 1 && !text[0].children[0].text) {
          onChange({ [TEXT_ATTRS.DATA]: null, [TEXT_ATTRS.ORIGIN_DATA]: null });
        } else {
          onChange({
            [TEXT_ATTRS.DATA]: TSON.stringify(blocksToLines(richText, text as BlockElement[])),
            [TEXT_ATTRS.ORIGIN_DATA]: TSON.stringify(text),
          });
        }
      }, 300),
    [onChange, richText]
  );

  const TextEditor = (
    <React.Fragment key={state.id}>
      {!visible && (
        <div className={styles.title}>
          富文本
          <IconLaunch className={styles.launch} onClick={() => setVisible(true)} />
        </div>
      )}
      <div onClick={e => e.stopPropagation()}>
        <MenuToolBar readonly={false} editor={richText}></MenuToolBar>
      </div>
      <Editable editor={richText} onChange={updateText} placeholder="Enter text ..."></Editable>
    </React.Fragment>
  );

  return visible ? (
    <Modal
      visible={visible}
      footer={null}
      focusLock={false}
      className={styles.modal}
      onCancel={() => setVisible(false)}
      title={<div className={styles.modalTitle}>富文本</div>}
    >
      {TextEditor}
    </Modal>
  ) : (
    TextEditor
  );
};
