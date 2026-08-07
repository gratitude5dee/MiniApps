import type * as React from "react";

import { shouldIncludeToolcraftPreviewBackground } from "@/toolcraft/runtime";
import { useToolcraftSelector } from "@/toolcraft/runtime/react";

import styles from "./wzrd-background.module.css";
import { getWzrdVisibleImageRects } from "./wzrd-scene-bounds";

const backgroundColorTarget = "appearance.background";
const defaultBackgroundColor = "#05070B";

export function WzrdBackgroundLayer(): React.JSX.Element | null {
  const backgroundVisible = useToolcraftSelector(
    (state) =>
      shouldIncludeToolcraftPreviewBackground({ state }) &&
      getWzrdVisibleImageRects(state).length === 0,
  );
  const backgroundColor = useToolcraftSelector((state) => {
    const value = state.values[backgroundColorTarget];
    const hex =
      typeof value === "string"
        ? value
        : value !== null &&
            typeof value === "object" &&
            "hex" in value &&
            typeof value.hex === "string"
          ? value.hex
          : undefined;
    const normalized = hex?.trim();
    return normalized ? normalized : defaultBackgroundColor;
  });

  if (!backgroundVisible) {
    return null;
  }

  return (
    <div
      className={styles.background}
      data-wzrd-background=""
      style={{ backgroundColor }}
    />
  );
}
