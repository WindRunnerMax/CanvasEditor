import type { Delta } from "sketching-delta";

import type { Editor } from "../editor";
import type { EditorState } from "./index";

export class DeltaState {
  public parent: DeltaState | EditorState | null = null;
  constructor(private editor: Editor, public readonly delta: Delta) {}
}
