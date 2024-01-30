import "doc-editor-light/dist/styles/index";

import { useMemoizedFn } from "ahooks";
import {
  BoldPlugin,
  DividingLinePlugin,
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
  SlatePlugins,
  StrikeThroughPlugin,
  UnderLinePlugin,
  UnorderedListPlugin,
  withSchema,
} from "doc-editor-light";
import type { FC } from "react";
import React, { useMemo } from "react";
import type { DeltaState, Editor } from "sketching-core";
import type { DeltaAttributes } from "sketching-delta";
import { Op, OP_TYPE } from "sketching-delta";
import { TEXT_ATTRS } from "sketching-plugin";
import { debounce, TSON } from "sketching-utils";
import type { BlockElement, Descendant } from "slate";
import { createEditor } from "slate";
import { withHistory } from "slate-history";
import { Editable, Slate, withReact } from "slate-react";

import { useIsMounted } from "../../../../hooks/is-mounted";
import styles from "../index.m.scss";
import { schema } from "./schema";
import { blocksToLines } from "./slate-kit";

export const Text: FC<{ editor: Editor; state: DeltaState }> = ({ editor, state }) => {
  const { isMounted } = useIsMounted();
  const richText = useMemo(() => withSchema(schema, withHistory(withReact(createEditor()))), []);

  const initText = useMemo(() => {
    const data = state.getAttr(TEXT_ATTRS.ORIGIN_DATA);
    const blocks = data && TSON.parse<BlockElement[]>(data);
    if (blocks) return blocks;
    return [{ children: [{ text: "" }] }] as BlockElement[];
  }, [state]);

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
      debounce((text: Descendant[]) => {
        // 双写-空间换时间
        // @ts-expect-error BlockElement
        if (text.length === 1 && text[0].children.length === 1 && !text[0].children[0].text) {
          onChange({ [TEXT_ATTRS.DATA]: null, [TEXT_ATTRS.ORIGIN_DATA]: null });
        } else {
          onChange({
            [TEXT_ATTRS.DATA]: TSON.stringify(blocksToLines(text as BlockElement[])),
            [TEXT_ATTRS.ORIGIN_DATA]: TSON.stringify(text),
          });
        }
      }, 300),
    [onChange]
  );

  const { renderElement, renderLeaf, onKeyDown, commands, onCopy } = useMemo(() => {
    const register = new SlatePlugins(
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
      LineHeightPlugin()
    );

    const commands = register.getCommands();
    register.add(ShortCutPlugin(richText, commands));

    return register.apply();
  }, [richText]);

  return (
    <React.Fragment>
      <div className={styles.title}>文本</div>
      <Slate editor={richText} value={initText} onChange={updateText}>
        <div onClick={e => e.stopPropagation()}>
          <MenuToolBar readonly={false} commands={commands} editor={richText}></MenuToolBar>
        </div>
        <Editable
          className={styles.richText}
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          readOnly={false}
          placeholder="Enter text ..."
          onKeyDown={onKeyDown}
          onCopy={e => onCopy(e, richText)}
        />
      </Slate>
    </React.Fragment>
  );
};