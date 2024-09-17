import { BLUE_4 } from "sketching-utils";

import type { Editor } from "../../editor";
import type { DeltaState } from "../../state/modules/node";
import { EDITOR_STATE } from "../../state/utils/constant";
import type { MouseEvent } from "../event/mouse";
import { Shape } from "../utils/shape";
import { Node } from "./node";

export class ElementNode extends Node {
  /** 节点 id */
  public readonly id: string;
  /** Hover 状态 */
  private isHovering: boolean;

  constructor(private editor: Editor, state: DeltaState) {
    const range = state.toRange();
    super(range);
    this.id = state.id;
    const delta = state.toDelta();
    const rect = delta.getRect();
    this.setZ(rect.z);
    this.isHovering = false;
  }

  protected onMouseDown = (e: MouseEvent) => {
    if (e.shiftKey) {
      this.editor.selection.addActiveDelta(this.id);
    } else {
      this.editor.selection.setActiveDelta(this.id);
    }
  };

  /**
   * 触发节点的 Hover 效果
   * @description Root - MouseLeave
   */
  protected onMouseEnter = () => {
    this.isHovering = true;
    if (this.editor.selection.has(this.id)) {
      return void 0;
    }
    this.editor.canvas.mask.drawingEffect(this.range);
  };

  /**
   * 移除节点的 Hover 效果
   * @description Root - MouseLeave
   */
  protected onMouseLeave = () => {
    this.isHovering = false;
    if (this.editor.selection.has(this.id)) {
      return void 0;
    }
    this.editor.canvas.mask.drawingEffect(this.range);
  };

  public drawingMask = (ctx: CanvasRenderingContext2D) => {
    if (
      this.isHovering &&
      // FIX: 避免全选删除后的 Hover 绘制
      this.editor.deltaSet.has(this.id) &&
      !this.editor.selection.has(this.id) &&
      !this.editor.state.get(EDITOR_STATE.MOUSE_DOWN)
    ) {
      const { x, y, width, height } = this.range.rect();
      Shape.frame(ctx, {
        x: x,
        y: y,
        width: width,
        height: height,
        borderColor: BLUE_4,
      });
    }
  };
}
