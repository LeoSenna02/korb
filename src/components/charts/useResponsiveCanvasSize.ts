"use client";

import { useEffect, useRef, useState } from "react";

interface UseResponsiveCanvasSizeOptions {
  minWidth: number;
}

export function useResponsiveCanvasSize({
  minWidth,
}: UseResponsiveCanvasSizeOptions) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(minWidth);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const updateWidth = () => {
      setWidth(Math.max(container.clientWidth, minWidth));
    };

    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(container);

    return () => observer.disconnect();
  }, [minWidth]);

  return { containerRef, width };
}
