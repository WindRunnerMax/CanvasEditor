export { DEFAULT_PRIORITY, NOOP, ROOT_DELTA } from "./constant";
export {
  cs,
  getUniqueId,
  isArray,
  isEmptyValue,
  isFunction,
  isNumber,
  isObject,
  isPlainNumber,
  isString,
  TSON,
} from "laser-utils";
import debounce from "lodash-es/debounce";
// Compat: FireFox https://github.com/lodash/lodash/issues/3126
import throttle from "lodash-es/throttle";
export { debounce, throttle };
export { findSetEffects } from "./set";
export type { Empty } from "./types";
