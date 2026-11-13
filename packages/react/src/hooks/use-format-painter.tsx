import type { AttributeMap } from "@block-kit/delta";
import type { FC } from "react";
import React, { createContext, useContext, useEffect, useState } from "react";

const FormatPainterContext = createContext<{
  format: AttributeMap | null;
  setFormat: (format: AttributeMap | null) => void;
}>({ format: null, setFormat: () => void 0 });

export const FormatPainterProvider: FC = ({ children }) => {
  const [format, setFormat] = useState<AttributeMap | null>(null);

  useEffect(() => {
    if (!format) return void 0;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFormat(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [format]);

  return (
    <FormatPainterContext.Provider value={{ format, setFormat }}>
      {children}
    </FormatPainterContext.Provider>
  );
};

export const useFormatPainter = () => useContext(FormatPainterContext);
