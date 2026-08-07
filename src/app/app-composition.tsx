import type { ToolcraftAppComposition } from "@/toolcraft/runtime/react";

import { appSchema } from "./app-schema";
import { WzrdBackgroundLayer } from "./wzrd-background";
import { wzrdSceneBoundsProvider } from "./wzrd-scene-bounds";

export const appComposition: ToolcraftAppComposition = {
  canvasContent: <WzrdBackgroundLayer />,
  exportRenderer: {
    baseFileName: "wzrd-image",
    renderFrame: () => {},
  },
  modelPresentation: { mode: "runtime" },
  sceneBoundsProvider: wzrdSceneBoundsProvider,
  schema: appSchema,
};
