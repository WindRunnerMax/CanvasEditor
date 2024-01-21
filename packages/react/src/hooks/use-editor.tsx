import React, { createContext } from "react";
import type { Editor } from "sketching-core";

export const EditorContext = createContext<Editor | null>(null);
export const WithEditor: React.FC<{ editor: Editor }> = props => {
  const { editor, children } = props;
  return <EditorContext.Provider value={editor}>{children}</EditorContext.Provider>;
};

export const useEditor = () => {
  const editor = React.useContext(EditorContext);
  if (!editor) {
    throw new Error("UseEditor must be used within a Sketching Editor Context");
  }
  return { editor };
};
