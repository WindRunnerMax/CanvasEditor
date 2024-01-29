import { ImageIcon } from "../../../static/image";
import { RectIcon } from "../../../static/rect";
import { TextIcon } from "../../../static/text";
import { NAV_ENUM } from "../../header/utils/constant";

export const ICON_ENUM: Record<string, JSX.Element> = {
  [NAV_ENUM.RECT]: RectIcon,
  [NAV_ENUM.IMAGE]: ImageIcon,
  [NAV_ENUM.TEXT]: TextIcon,
};
