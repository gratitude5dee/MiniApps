import {
  getToolcraftSceneElementRect,
  type ToolcraftProductSceneBoundsProvider,
  type ToolcraftSceneRect,
  type ToolcraftState,
} from "@/toolcraft/runtime";
import { isToolcraftLayerVisibleInTree } from "@/toolcraft/runtime/react";

export function getWzrdVisibleImageRects(
  state: Readonly<ToolcraftState>,
): ToolcraftSceneRect[] {
  return state.mediaAssets.flatMap((asset) => {
    if (
      asset.assetKind !== "image" ||
      asset.lifecycle === "unavailable" ||
      asset.size === undefined ||
      !isToolcraftLayerVisibleInTree(state.layers, asset.layerId)
    ) {
      return [];
    }

    const quarterTurn =
      asset.transform?.rotationDeg === 90 ||
      asset.transform?.rotationDeg === 270;
    return [
      getToolcraftSceneElementRect({
        position: asset.position,
        size: quarterTurn
          ? { height: asset.size.width, unit: "px", width: asset.size.height }
          : asset.size,
      }),
    ];
  });
}

export const wzrdSceneBoundsProvider: ToolcraftProductSceneBoundsProvider = ({
  state,
}) => getWzrdVisibleImageRects(state);
