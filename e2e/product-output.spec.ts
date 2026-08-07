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
  "browser: the sticky Export PNG action delivers the runtime image artifact",
  async ({ page }) => {
    const row = requireAcceptanceRow("output.export");
    const session = await openProofSession(page);
    await uploadFixture(page);

    await expectToolcraftImageExportArtifact(
      session.targetAction("actions.output", async () => exportImage(page)),
      {
        backgroundRgba,
        expectedBounds: fullBounds,
        expectedHeight: 4096,
        expectedMediaType: "image/png",
        expectedPixels: quadrantPixels,
        expectedWidth: 4096,
        page,
        requirementId: row.id,
      },
    );
  },
);

