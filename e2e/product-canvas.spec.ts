import { expect as playwrightExpect } from "@playwright/test";

import { expectToolcraftExportedArtifact } from "./browser-acceptance-outcome-helpers";
import { expectToolcraftControlApplicabilityState } from "./browser-control-applicability-evidence";
import {
  expectToolcraftInfinityCanvasImageExportEvidence,
  expectToolcraftInfinityCanvasModeEvidence,
  observeInfinityCanvas,
} from "./browser-infinity-canvas-evidence";
import { expectToolcraftImageExportArtifact } from "./browser-media-export-evidence";
import { inspectToolcraftImageDownload } from "./image-artifact-inspection";
import {
  backgroundRgba,
  exportImage,
  fixtureSceneRect,
  fullBounds,
  openProofSession,
  quadrantPixels,
  requireAcceptanceRow,
  requireApplicabilityCase,
  selectOption,
  setSwitch,
  uploadFixture,
} from "./product-image-support";
import { expect, test } from "./toolcraft-product-test";

test.setTimeout(240_000);

test(
  "browser: infinity canvas hides finite size controls and restores the dormant finite size",
  async ({ page }) => {
    const row = requireAcceptanceRow("canvas.infinity.mode");
    await openProofSession(page);
    await uploadFixture(page);

    const before = await observeInfinityCanvas(page);
    await setSwitch(page, "canvas.infinity", true);
    const enabled = await observeInfinityCanvas(page);

    const surface = page.locator("[data-toolcraft-canvas-mode]");
    const surfaceBox = await surface.boundingBox();
    if (!surfaceBox) {
      throw new Error("Infinity canvas proof requires a visible canvas surface.");
    }
    await page.mouse.move(
      surfaceBox.x + surfaceBox.width / 2,
      surfaceBox.y + surfaceBox.height / 2,
    );
    await page.mouse.down();
    await page.mouse.move(
      surfaceBox.x + surfaceBox.width / 2 + 120,
      surfaceBox.y + surfaceBox.height / 2 + 60,
      { steps: 8 },
    );
    await page.mouse.up();
    const afterPan = await observeInfinityCanvas(page);

    await page.reload();
    await playwrightExpect(
      page.locator("[data-canvas-media-layer] img"),
    ).toBeVisible();
    const afterReload = await observeInfinityCanvas(page);

    await setSwitch(page, "canvas.infinity", false);
    const restored = await observeInfinityCanvas(page);
    await page.getByRole("button", { name: "Undo" }).click();
    const undone = await observeInfinityCanvas(page);
    await page.getByRole("button", { name: "Redo" }).click();
    const redone = await observeInfinityCanvas(page);

    await expectToolcraftInfinityCanvasModeEvidence(
      { afterPan, afterReload, before, enabled, redone, restored, undone },
      {
        expectedFiniteSize: { height: 1080, width: 1080 },
        expectedSceneRect: fixtureSceneRect,
        requirementId: row.id,
        target: row.target,
      },
    );
  },
);

test(
  "browser: infinite image export crops to the union of visible scene elements",
  async ({ page }) => {
    const row = requireAcceptanceRow("canvas.infinity.export");
    await openProofSession(page);
    await uploadFixture(page);

    const finiteDownload = await exportImage(page);
    const finite = await inspectToolcraftImageDownload({
      backgroundRgba,
      download: finiteDownload,
      page,
    });

    await setSwitch(page, "canvas.infinity", true);
    const infiniteDownload = await exportImage(page);
    const infinite = await inspectToolcraftImageDownload({
      backgroundRgba,
      download: infiniteDownload,
      page,
    });

    await expectToolcraftInfinityCanvasImageExportEvidence(
      {
        finite: {
          byteLength: finite.inspection.byteLength,
          height: finite.inspection.height,
          width: finite.inspection.width,
        },
        infinite: {
          byteLength: infinite.inspection.byteLength,
          height: infinite.inspection.height,
          width: infinite.inspection.width,
        },
      },
      {
        expectedFiniteSize: { height: 4096, width: 4096 },
        expectedInfiniteSize: { height: 2048, width: 4096 },
        requirementId: row.id,
        target: row.target,
      },
    );
  },
);
