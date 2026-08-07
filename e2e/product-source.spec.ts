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
  "browser: source image upload, transform, removal, and reset drive the canvas media output",
  async ({ page }) => {
    const row = requireAcceptanceRow("source.image.upload");
    const session = await openProofSession(page);

    const observeMedia = session.observe((root) => {
      const layers = [
        ...root.querySelectorAll<HTMLElement>("[data-canvas-media-layer]"),
      ];
      const parts = layers.map((layer) => {
        const image = layer.querySelector<HTMLImageElement>("img");
        return `${image?.alt ?? ""}|${image?.style.transform ?? ""}`;
      });
      return {
        itemIds: layers.map(
          (layer) => layer.getAttribute("data-canvas-media-layer") ?? "",
        ),
        outputSignature: parts.length === 0 ? "empty" : parts.join(";"),
      };
    });

    const lifecycle = session.targetAction("source.image", async () => {
      const source = getControl(page, "source.image");
      const fileInput = source.locator('input[type="file"]');
      const layerImage = page.locator("[data-canvas-media-layer] img");
      const upload = async (fileName: string) => {
        await fileInput.setInputFiles({
          buffer: Buffer.from(fixtureSvg),
          mimeType: "image/svg+xml",
          name: fileName,
        });
        await playwrightExpect(
          page.locator(`[data-canvas-media-layer] img[alt="${fileName}"]`),
        ).toBeVisible();
      };

      // upload
      await upload(fixtureFileName);
      // rotate + flip drive the rendered transform output
      await source.getByRole("button", { name: "90° Right" }).click();
      await playwrightExpect(layerImage).toHaveCSS(
        "transform",
        /matrix\(/u,
      );
      const rotatedTransform = await layerImage.evaluate(
        (element) => element.style.transform,
      );
      playwrightExpect(rotatedTransform).toContain("rotate(90deg)");
      await source.getByRole("button", { name: "Flip horizontal" }).click();
      await playwrightExpect
        .poll(async () =>
          layerImage.evaluate((element) => element.style.transform),
        )
        .toContain("scale(-1, 1)");
      await source.getByRole("button", { name: "Flip vertical" }).click();
      await playwrightExpect
        .poll(async () =>
          layerImage.evaluate((element) => element.style.transform),
        )
        .toContain("scale(-1, -1)");

      // remove
      await source
        .getByRole("button", { name: `Remove ${fixtureFileName}` })
        .click();
      await playwrightExpect(
        page.locator("[data-canvas-media-layer]"),
      ).toHaveCount(0);

      // re-upload, then reset back to the schema default (no image)
      await upload("wzrd-second.svg");
      await page.getByRole("button", { name: "Reset controls" }).click();
      await playwrightExpect(
        page.locator("[data-canvas-media-layer]"),
      ).toHaveCount(0);

      // final upload proves the default-reset canvas accepts media again
      await upload("wzrd-final.svg");
    });

    await expectToolcraftMediaLifecycle(
      observeMedia,
      lifecycle,
      { itemIds: ["layer-2"], outputSignature: "wzrd-final.svg|" },
      { requirementId: row.id, timeoutMs: 30_000 },
    );
  },
);

