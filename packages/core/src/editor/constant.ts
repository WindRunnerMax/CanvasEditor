import type { DeltaLike, DeltaSetLike } from "sketching-delta";
import { ROOT_ZONE } from "sketching-utils";

import { EntryDelta } from "./entry";

export const DEFAULT_DELTA_LIKE: DeltaLike = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  key: EntryDelta.KEY,
};

export const DEFAULT_DELTA_SET_LIKE: DeltaSetLike = {
  [ROOT_ZONE]: DEFAULT_DELTA_LIKE,
};
