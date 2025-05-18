import "./index.scss";
import "@block-kit/plugin/dist/styles/index.css";

import type { ContentChangeEvent } from "@block-kit/core";
import { Editor as BlockEditor, EDITOR_EVENT } from "@block-kit/core";
import { LOG_LEVEL } from "@block-kit/core";
import type { Delta as BlockDelta } from "@block-kit/delta";
import {
  BackgroundPlugin,
  BoldPlugin,
  BulletListPlugin,
  DividerPlugin,
  FloatToolbar,
  FontColorPlugin,
  FontSizePlugin,
  ImagePlugin,
  IndentPlugin,
  InlineCodePlugin,
  ItalicPlugin,
  LineHeightPlugin,
  LinkPlugin,
  OrderListPlugin,
  setMountDOM,
  Shortcut,
  StrikePlugin,
  ToolBarMixin as Tools,
  UnderlinePlugin,
} from "@block-kit/plugin";
import { BlockKit, Editable } from "@block-kit/react";
import { useMemoFn } from "@block-kit/utils/dist/es/hooks";
import type { FC } from "react";
import React, { useEffect, useMemo } from "react";
import type { DeltaState } from "sketching-core";
import type { Editor } from "sketching-core";
import { Op, OP_TYPE } from "sketching-delta";
import type { Attributes } from "sketching-plugin";
import { TEXT_ATTRS } from "sketching-plugin";
import { debounce, TSON } from "sketching-utils";

import { useIsMounted } from "../../../../../hooks/is-mounted";
import { schema } from "../config/schema";
import { getDefaultTextDelta } from "../utils/constant";
import { textDeltaToSketch } from "../utils/transform";
import { PRESET_SHORTCUT } from "./short-cut";

export const RichTextEditor: FC<{
  dataRef: React.MutableRefObject<BlockDelta | null>;
  editor: Editor;
  state: DeltaState;
}> = props => {
  const { dataRef, editor, state } = props;
  const { mounted } = useIsMounted();

  const blockEditor = useMemo(() => {
    const instance = new BlockEditor({
      delta: dataRef.current || getDefaultTextDelta(),
      logLevel: LOG_LEVEL.ERROR,
      schema,
    });
    instance.plugin.register(
      new BoldPlugin(instance),
      new ItalicPlugin(instance),
      new UnderlinePlugin(instance),
      new StrikePlugin(instance),
      new ImagePlugin(instance),
      new InlineCodePlugin(instance),
      new LineHeightPlugin(instance),
      new FontSizePlugin(instance),
      new FontColorPlugin(instance),
      new BackgroundPlugin(instance),
      new DividerPlugin(instance),
      new BulletListPlugin(instance),
      new OrderListPlugin(instance),
      new IndentPlugin(instance),
      new LinkPlugin(instance),
      new Shortcut(instance, PRESET_SHORTCUT)
    );
    return instance;
  }, [dataRef]);

  const onSaveChange = useMemoFn((current: BlockDelta) => {
    if (!mounted.current) return void 0;
    const attrs: Attributes = {
      [TEXT_ATTRS.DATA]: TSON.stringify(textDeltaToSketch(current))!,
    };
    editor.state.apply(new Op(OP_TYPE.REVISE, { id: state.id, attrs }));
  });

  useEffect(() => {
    const updateText = debounce((event: ContentChangeEvent) => {
      const { current } = event;
      dataRef.current = current;
      onSaveChange(current);
    }, 300);
    blockEditor.event.on(EDITOR_EVENT.CONTENT_CHANGE, updateText);
    return () => {
      blockEditor.event.off(EDITOR_EVENT.CONTENT_CHANGE, updateText);
    };
  }, [blockEditor.event, dataRef, onSaveChange]);

  const onMountRef = useMemoFn((e: HTMLElement | null) => {
    e && setMountDOM(blockEditor, e);
  });

  const overridePosition = () => {
    const rect = blockEditor.rect.getRawSelectionRect();
    if (rect) {
      const t = rect.top - 8;
      let l = rect.left + rect.width / 2;
      if (l + 200 > window.innerWidth) {
        l = window.innerWidth - 200;
      }
      return { top: t, left: l };
    }
    return { top: -999999, left: -999999 };
  };

  return (
    <BlockKit editor={blockEditor} readonly={false}>
      <div className="block-kit-editor-container">
        <FloatToolbar mountDOM={document.body} overridePosition={overridePosition}>
          <Tools.Bold></Tools.Bold>
          <Tools.Italic></Tools.Italic>
          <Tools.Underline></Tools.Underline>
          <Tools.Strike></Tools.Strike>
          <Tools.Link></Tools.Link>
          <Tools.InlineCode></Tools.InlineCode>
          <Tools.FontSize></Tools.FontSize>
          <Tools.FontColor></Tools.FontColor>
          <Tools.LineHeight></Tools.LineHeight>
        </FloatToolbar>
        <div className="block-kit-editable-container">
          <div className="block-kit-mount-dom" ref={onMountRef}></div>
          <Editable
            placeholder="Please Enter..."
            autoFocus
            className="block-kit-editable"
          ></Editable>
        </div>
      </div>
    </BlockKit>
  );
};
