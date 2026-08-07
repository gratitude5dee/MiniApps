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
  "browser: image export format selection changes the exported artifact encoding",
  async ({ page }) => {
    const row = requireAcceptanceRow("export.image.format");
    const session = await openProofSession(page);
    await uploadFixture(page);

    const resolutions = [
      { label: "2K", longEdge: 2048, value: "2k" },
      { label: "4K", longEdge: 4096, value: "4k" },
      { label: "8K", longEdge: 8192, value: "8k" },
    ] as const;

    for (const resolution of resolutions) {
      const applicabilityCase = requireApplicabilityCase(
        "export.image.format",
        "export.image.resolution",
        resolution.value,
      );
      const requirementId = `${row.id}#applicability:export.image.resolution=${encodeURIComponent(JSON.stringify(resolution.value))}:visible`;
      await expectToolcraftControlApplicabilityState(
        session,
        session.targetAction("export.image.resolution", async () => {
          await selectOption(page, "export.image.resolution", resolution.label);
        }),
        applicabilityCase,
        { baseRequirementId: row.id },
      );

      await selectOption(page, "export.image.format", "PNG");
      const pngDownload = await exportImage(page);
      const png = await inspectToolcraftImageDownload({
        backgroundRgba,
        download: pngDownload,
        page,
      });
      expect(png.inspection.mediaType).toBe("image/png");
      expect(
        Math.max(png.inspection.width, png.inspection.height),
      ).toBe(resolution.longEdge);

      await selectOption(page, "export.image.format", "JPG");
      await expectToolcraftExportedArtifact(
        session.targetAction("export.image.format", async () =>
          exportImage(page),
        ),
        async (download) => {
          const jpg = await inspectToolcraftImageDownload({
            backgroundRgba,
            download,
            page,
          });
          expect(jpg.inspection.mediaType).toBe("image/jpeg");
          expect(jpg.inspection.mediaType).not.toBe(png.inspection.mediaType);
          expect(
            Math.max(jpg.inspection.width, jpg.inspection.height),
          ).toBe(resolution.longEdge);
          return jpg.inspection;
        },
        { requirementId },
      );
    }
  },
);

test(
  "browser: image export resolution selection changes the exported artifact dimensions",
  async ({ page }) => {
    const row = requireAcceptanceRow("export.image.resolution");
    const session = await openProofSession(page);
    await uploadFixture(page);

    const formats = [
      { label: "PNG", mediaType: "image/png", value: "png" },
      { label: "JPG", mediaType: "image/jpeg", value: "jpg" },
    ] as const;

    for (const format of formats) {
      const applicabilityCase = requireApplicabilityCase(
        "export.image.resolution",
        "export.image.format",
        format.value,
      );
      const requirementId = `${row.id}#applicability:export.image.format=${encodeURIComponent(JSON.stringify(format.value))}:visible`;
      await expectToolcraftControlApplicabilityState(
        session,
        session.targetAction("export.image.format", async () => {
          await selectOption(page, "export.image.format", format.label);
        }),
        applicabilityCase,
        { baseRequirementId: row.id },
      );

      await selectOption(page, "export.image.resolution", "2K");
      const smallDownload = await exportImage(page);
      const small = await inspectToolcraftImageDownload({
        backgroundRgba,
        download: smallDownload,
        page,
      });
      expect(small.inspection.mediaType).toBe(format.mediaType);
      expect(
        Math.max(small.inspection.width, small.inspection.height),
      ).toBe(2048);

      await selectOption(page, "export.image.resolution", "4K");
      await expectToolcraftExportedArtifact(
        session.targetAction("export.image.resolution", async () =>
          exportImage(page),
        ),
        async (download) => {
          const large = await inspectToolcraftImageDownload({
            backgroundRgba,
            download,
            page,
          });
          expect(large.inspection.mediaType).toBe(format.mediaType);
          expect(
            Math.max(large.inspection.width, large.inspection.height),
          ).toBe(4096);
          expect(large.inspection.width).not.toBe(small.inspection.width);
          return large.inspection;
        },
        { requirementId },
      );
    }

    await selectOption(page, "export.image.format", "PNG");
    await selectOption(page, "export.image.resolution", "8K");
    const hugeDownload = await exportImage(page);
    const huge = await inspectToolcraftImageDownload({
      backgroundRgba,
      download: hugeDownload,
      page,
    });
    expect(Math.max(huge.inspection.width, huge.inspection.height)).toBe(8192);
  },
);

