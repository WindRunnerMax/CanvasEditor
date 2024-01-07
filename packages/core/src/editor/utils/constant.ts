import type { DeltaLike, DeltaSetLike } from "sketching-delta";
import { ROOT_DELTA } from "sketching-utils";

import { EntryDelta } from "../delta/entry";

export const DEFAULT_DELTA_LIKE: DeltaLike = {
  x: -999999,
  y: -999999,
  width: 0,
  height: 0,
  key: EntryDelta.KEY,
};

export const DEFAULT_DELTA_SET_LIKE: DeltaSetLike = {
  [ROOT_DELTA]: DEFAULT_DELTA_LIKE,
};
