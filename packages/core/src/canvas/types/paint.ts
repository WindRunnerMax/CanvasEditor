import type { Delta } from "sketching-delta";

export type DrawingEffectOptions = {
  immediately?: boolean;
  force?: boolean;
};

export type DrawingGraphEffectOptions = {
  isAsyncTask?: boolean;
};

export type AsyncDrawingTask = Promise<Delta>;
