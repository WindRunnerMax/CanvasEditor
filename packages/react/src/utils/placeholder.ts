import type { Editor } from "sketching-core";
import { EmptyNode, Range } from "sketching-core";

import {
  BOTTOM_PLACEHOLDER,
  DPI,
  LEFT_PLACEHOLDER,
  OFFSET_POINT,
  PLACEHOLDER_SIZE,
  RIGHT_PLACEHOLDER,
  TOP_PLACEHOLDER,
} from "./constant";

export const withPlaceHolder = (options: { editor: Editor; width: number; height: number }) => {
  const { editor, width, height } = options;
  const opWidthPX = (width * DPI) / 25.4;
  const opHeightPX = (height * DPI) / 25.4;
  editor.canvas.root.append(
    new EmptyNode(
      LEFT_PLACEHOLDER,
      Range.from(
        OFFSET_POINT.x - PLACEHOLDER_SIZE,
        OFFSET_POINT.y - PLACEHOLDER_SIZE,
        OFFSET_POINT.x,
        OFFSET_POINT.y + PLACEHOLDER_SIZE + opHeightPX
      )
    )
  );
  editor.canvas.root.append(
    new EmptyNode(
      TOP_PLACEHOLDER,
      Range.from(
        OFFSET_POINT.x - PLACEHOLDER_SIZE,
        OFFSET_POINT.y - PLACEHOLDER_SIZE,
        OFFSET_POINT.x + PLACEHOLDER_SIZE + opWidthPX,
        OFFSET_POINT.y
      )
    )
  );
  editor.canvas.root.append(
    new EmptyNode(
      RIGHT_PLACEHOLDER,
      Range.from(
        OFFSET_POINT.x + opWidthPX,
        OFFSET_POINT.y - PLACEHOLDER_SIZE,
        OFFSET_POINT.x + PLACEHOLDER_SIZE + opWidthPX,
        OFFSET_POINT.y + PLACEHOLDER_SIZE + opHeightPX
      )
    )
  );
  editor.canvas.root.append(
    new EmptyNode(
      BOTTOM_PLACEHOLDER,
      Range.from(
        OFFSET_POINT.x - PLACEHOLDER_SIZE,
        OFFSET_POINT.y + opHeightPX,
        OFFSET_POINT.x + PLACEHOLDER_SIZE + opWidthPX,
        OFFSET_POINT.y + PLACEHOLDER_SIZE + opHeightPX
      )
    )
  );
};
