import "doc-editor-light/dist/styles/index";

import { useMemoizedFn } from "ahooks";
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
  SlatePlugins,
  StrikeThroughPlugin,
  UnderLinePlugin,
  UnorderedListPlugin,
  withSchema,
} from "doc-editor-light";
import type { FC } from "react";
import React, { useMemo } from "react";
import type { DeltaState, Editor } from "sketching-core";
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

export const Text: FC<{ editor: Editor; state: DeltaState }> = ({ editor, state }) => {
  const { isMounted } = useIsMounted();
  const richText = useMemo(() => withSchema(schema, withHistory(withReact(createEditor()))), []);

  const initText = useMemo(() => {
    const data = state.getAttr(TEXT_ATTRS.DATA);
    if (data) {
      const blocks = TSON.parse<BlockElement[]>(data);
      if (blocks) return blocks;
    }
    return [{ children: [{ text: "" }] }] as BlockElement[];
  }, [state]);

  const onChange = useMemoizedFn((key: string, value: string | null) => {
    // COMPAT: 避免初始化时即触发`onChange`
    if (!isMounted() || state.getAttr(key) === value) return void 0;
    editor.state.apply(new Op(OP_TYPE.REVISE, { id: state.id, attrs: { [key]: value } }));
  });

  const updateText = useMemo(
    () =>
      debounce((text: Descendant[]) => {
        // @ts-expect-error BlockElement
        if (text.length === 1 && text[0].children.length === 1 && !text[0].children[0].text) {
          onChange(TEXT_ATTRS.DATA, null);
        } else {
          onChange(TEXT_ATTRS.DATA, TSON.stringify(text));
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
