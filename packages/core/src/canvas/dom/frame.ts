import { NOOP, throttle } from "sketching-utils";

import type { Editor } from "../../editor";
import { EDITOR_EVENT } from "../../event/bus/action";
import { Point } from "../../selection/point";
import { Range } from "../../selection/range";
import type { MouseEvent } from "../basis/event";
import { Node } from "../basis/node";
import type { Root } from "../state/root";
import { MAX_Z_INDEX, RESIZE_OFS, SELECT_BIAS, THE_CONFIG, THE_DELAY } from "../utils/constant";
import { BLUE_5, BLUE_6_6 } from "../utils/palette";
import { drawRect } from "../utils/shape";

export class FrameNode extends Node {
  private isDragging: boolean;
  private landing: Point | null;
  private dragged: Range | null;
  private savedRootMouseDown: (e: MouseEvent) => void;

  constructor(private editor: Editor, private root: Root) {
    super(Range.reset());
    this.dragged = null;
    this.landing = null;
    this._z = MAX_Z_INDEX;
    this.isDragging = false;
    this.savedRootMouseDown = this.root.onMouseDown || NOOP;
    this.root.onMouseDown = this.onRootMouseDown;
  }

  private onRootMouseDown = (e: MouseEvent) => {
    this.savedRootMouseDown(e);
    this.editor.event.on(EDITOR_EVENT.MOUSE_UP, this.onMouseUpController);
    this.editor.event.on(EDITOR_EVENT.MOUSE_MOVE, this.onMouseMoveController);
    this.landing = Point.from(e.x, e.y);
  };

  private onMouseMoveBridge = (e: globalThis.MouseEvent) => {
    if (!this.landing) return void 0;
    const point = Point.from(e, this.editor);
    const { x, y } = this.landing.diff(point);
    if (!this.isDragging && (Math.abs(x) > SELECT_BIAS || Math.abs(y) > SELECT_BIAS)) {
      // 拖拽阈值
      this.isDragging = true;
    }
    if (this.isDragging) {
      const latest = new Range({
        startX: this.landing.x,
        startY: this.landing.y,
        endX: point.x,
        endY: point.y,
      }).normalize();
      this.setRange(latest);
      // 获取获取与选区交叉的所有`State`节点
      const effects: string[] = [];
      this.editor.state.getDeltas().forEach(state => {
        if (latest.intersect(state.toRange())) {
          effects.push(state.id);
        }
      });
      this.editor.selection.setActiveDelta(...effects);
      // 重绘拖拽过的最大区域
      const zoomed = latest.zoom(RESIZE_OFS);
      this.dragged = this.dragged ? this.dragged.compose(zoomed) : zoomed;
      this.editor.canvas.mask.drawingEffect(this.dragged);
    }
  };
  private onMouseMoveController = throttle(this.onMouseMoveBridge, THE_DELAY, THE_CONFIG);

  private onMouseUpController = () => {
    this.editor.event.off(EDITOR_EVENT.MOUSE_UP, this.onMouseUpController);
    this.editor.event.off(EDITOR_EVENT.MOUSE_MOVE, this.onMouseMoveController);
    this.setRange(Range.from(0, 0));
    if (this.isDragging) {
      this.dragged && this.editor.canvas.mask.drawingEffect(this.dragged);
    }
    this.landing = null;
    this.isDragging = false;
    this.dragged = null;
    this.setRange(Range.reset());
  };

  public drawingMask = (ctx: CanvasRenderingContext2D) => {
    if (this.isDragging) {
      const { x, y, width, height } = this.range.rect();
      drawRect(ctx, { x, y, width, height, borderColor: BLUE_5, fillColor: BLUE_6_6 });
    }
  };
}
