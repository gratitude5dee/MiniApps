import { expect as playwrightExpect, type Page } from "@playwright/test";

import { expectToolcraftBackgroundOutputSemantics } from "./browser-background-output-evidence";
import { expectToolcraftControlApplicabilityState } from "./browser-control-applicability-evidence";
import {
  expectToolcraftInfinityCanvasBackgroundEvidence,
  observeInfinityCanvasBackground,
} from "./browser-infinity-canvas-evidence";
import { expectToolcraftMediaLifecycle } from "./browser-state-evidence-helpers";
import { inspectToolcraftImageDownload } from "./image-artifact-inspection";
import { expectToolcraftProductObservableToChange } from "./product-observable-helpers";
import {
  backgroundRgba,
  exportImage,
  fixtureFileName,
  fixtureSvg,
  getControl,
  openProofSession,
  requireAcceptanceRow,
  requireApplicabilityCase,
  setBackgroundColor,
  setSwitch,
} from "./product-image-support";
import { test } from "./toolcraft-product-test";

test.setTimeout(240_000);

test(
  "browser: background switch controls preview visibility and export transparency",
  async ({ page }) => {
    const row = requireAcceptanceRow("background.enabled");
    const session = await openProofSession(page);

    // Infinity viewport recipe: infinite viewport uses the selected color,
    // disabling Background atomically exits infinite mode.
    await setSwitch(page, "canvas.infinity", true);
    const infinite = await observeInfinityCanvasBackground(page);
    await setSwitch(page, "export.includeBackground", false);
    const backgroundExcluded = await observeInfinityCanvasBackground(page);
    await setSwitch(page, "export.includeBackground", true);
    const backgroundRestored = await observeInfinityCanvasBackground(page);
    await expectToolcraftInfinityCanvasBackgroundEvidence(
      { backgroundExcluded, backgroundRestored, infinite },
      {
        expectedBackgroundColor: "#05070B",
        requirementId: row.id,
        target: row.target,
      },
    );

    // Preview visibility plus transparent PNG export on the finite canvas.
    const observePreview = session.observe((root) => {
      const layer = root.querySelector<HTMLElement>("[data-wzrd-background]");
      return {
        backgroundVisible: layer !== null,
        outputSignature: layer
          ? `visible:${getComputedStyle(layer).backgroundColor}`
          : "hidden",
      };
    });
    const excludeBackground = session.targetAction(
      "export.includeBackground",
      async () => {
        await setSwitch(page, "export.includeBackground", false);
      },
    );
    const exportArtifact = session.action(async () => exportImage(page));

    await expectToolcraftBackgroundOutputSemantics(
      observePreview,
      excludeBackground,
      { backgroundVisible: false, outputSignature: "hidden" },
      exportArtifact,
      async (download) => {
        const inspected = await inspectToolcraftImageDownload({
          backgroundRgba,
          download,
          page,
        });
        const corner = inspected.observation.normalizedPixels.slice(0, 4);
        return {
          ...inspected.inspection,
          backgroundAlpha: corner[3] ?? -1,
        };
      },
      { requirementId: row.id, timeoutMs: 30_000 },
    );
  },
);

test(
  "browser: background color changes the rendered canvas pixels",
  async ({ page }: { page: Page }) => {
    const row = requireAcceptanceRow("background.color");
    const session = await openProofSession(page);

    const offCase = requireApplicabilityCase(
      "appearance.background",
      "export.includeBackground",
      false,
    );
    const onCase = requireApplicabilityCase(
      "appearance.background",
      "export.includeBackground",
      true,
    );
    const offRequirementId = `${row.id}#applicability:export.includeBackground=false:visible`;
    const onRequirementId = `${row.id}#applicability:export.includeBackground=true:visible`;

    await playwrightExpect(page.locator("[data-wzrd-background]")).toBeVisible();
    // A color chosen while the background is excluded must drive the product
    // output as soon as the background is composited again.
    await expectToolcraftProductObservableToChange(
      session,
      session.targetAction("appearance.background", async () => {
        await setSwitch(page, "export.includeBackground", false);
        await setBackgroundColor(page, "#2F6BFF");
        await setSwitch(page, "export.includeBackground", true);
        await playwrightExpect(
          page.locator("[data-wzrd-background]"),
        ).toHaveCSS("background-color", "rgb(47, 107, 255)");
      }),
      {
        requirementId: offRequirementId,
        selector: "[data-wzrd-background]",
        timeoutMs: 30_000,
      },
    );

    await expectToolcraftControlApplicabilityState(
      session,
      session.targetAction("export.includeBackground", async () => {
        await setSwitch(page, "export.includeBackground", false);
      }),
      offCase,
      { baseRequirementId: row.id },
    );

    await expectToolcraftControlApplicabilityState(
      session,
      session.targetAction("export.includeBackground", async () => {
        await setSwitch(page, "export.includeBackground", true);
      }),
      onCase,
      { baseRequirementId: row.id },
    );
    await expectToolcraftProductObservableToChange(
      session,
      session.targetAction("appearance.background", async () => {
        await setBackgroundColor(page, "#E7EBF2");
        await playwrightExpect(
          page.locator("[data-wzrd-background]"),
        ).toHaveCSS("background-color", "rgb(231, 235, 242)");
      }),
      {
        requirementId: onRequirementId,
        selector: "[data-wzrd-background]",
        timeoutMs: 30_000,
      },
    );
  },
);
