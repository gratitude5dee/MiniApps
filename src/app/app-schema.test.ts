import { describe, expect, it } from "vitest";

import {
  appAcceptance,
  appControlSectionInventory,
  validateProductAcceptanceCoverage,
} from "./app-acceptance";
import { appPerformance } from "./app-performance";
import { appSchema } from "./app-schema";

function getSection(id: string) {
  const section = appSchema.panels.controls?.sections.find(
    (candidate) => candidate.id === id,
  );
  if (!section) throw new Error(`Missing product section "${id}".`);
  return section;
}

function getControlByTarget(target: string) {
  for (const section of appSchema.panels.controls?.sections ?? []) {
    for (const control of Object.values(section.controls)) {
      if (control.target === target) return control;
    }
  }
  throw new Error(`Missing control with target "${target}".`);
}

describe("appSchema", () => {
  it("publishes the base Toolcraft template app contract for AI assembly", () => {
    expect(appSchema.canvas.draggable).toBe(true);
    expect(appSchema.canvas.enabled).toBe(true);
    expect(appSchema.canvas.sizing).toEqual({ mode: "editable-output" });
    expect(appSchema.canvas.upload).toBe(true);
    expect(appSchema.panels.controls?.sections[0]?.title).toBe("Setup");
    expect(appSchema.panels.layers).toBeUndefined();
    expect(appSchema.panels.timeline).toBeUndefined();
    expect(appSchema.toolbar).toEqual({
      history: true,
      radar: true,
      theme: true,
      zoom: true,
    });
    expect(appSchema.assembly.commands).toEqual(
      expect.arrayContaining([
        "canvas.center",
        "canvas.setSize",
        "controls.setValue",
        "history.undo",
        "media.delete",
        "media.import",
      ]),
    );
  });

  it("declares the WZRD Image product sections with stable ids", () => {
    const inventoryIds = appControlSectionInventory.map((entry) => entry.id);
    expect(inventoryIds).toEqual(["source", "background", "image-export"]);
    expect(appSchema.identity).toEqual({
      id: "wzrd-image",
      title: "WZRD Image",
    });
  });

  it("declares the source image fileDrop contract", () => {
    const section = getSection("source");
    expect(section.controls.sourceImage).toMatchObject({
      accept: "image/*",
      assetKind: "image",
      target: "source.image",
      type: "fileDrop",
    });
    expect(
      appAcceptance.find((entry) => entry.id === "source.image.upload"),
    ).toMatchObject({
      automated: true,
      browser: true,
      evidence: "media-lifecycle",
      target: "source.image",
    });
  });

  it("declares the background include switch contract", () => {
    expect(getControlByTarget("export.includeBackground")).toMatchObject({
      defaultValue: true,
      target: "export.includeBackground",
      type: "switch",
    });
    expect(
      appAcceptance.find((entry) => entry.id === "background.enabled"),
    ).toMatchObject({
      backgroundOutputCoverage: "all-required-background-output",
      evidence: "rendered-pixels",
      target: "export.includeBackground",
    });
  });

  it("declares the background color contract", () => {
    expect(getControlByTarget("appearance.background")).toMatchObject({
      defaultValue: "#05070B",
      target: "appearance.background",
      type: "color",
    });
    expect(
      appAcceptance.find((entry) => entry.id === "background.color"),
    ).toMatchObject({
      evidence: "rendered-pixels",
      target: "appearance.background",
    });
  });

  it("declares the image export format contract", () => {
    const section = getSection("image-export");
    expect(section.controls.imageExportFormat).toMatchObject({
      defaultValue: "png",
      target: "export.image.format",
      type: "select",
    });
    expect(
      appAcceptance.find((entry) => entry.id === "export.image.format"),
    ).toMatchObject({
      evidence: "exported-bytes",
      optionCoverage: "each-visible-item",
      target: "export.image.format",
    });
  });

  it("declares the image export resolution contract", () => {
    const section = getSection("image-export");
    expect(section.controls.imageExportResolution).toMatchObject({
      defaultValue: "4k",
      target: "export.image.resolution",
      type: "select",
    });
    expect(
      appAcceptance.find((entry) => entry.id === "export.image.resolution"),
    ).toMatchObject({
      evidence: "exported-bytes",
      optionCoverage: "each-visible-item",
      target: "export.image.resolution",
    });
  });

  it("declares the sticky export action contract", () => {
    expect(getControlByTarget("actions.output")).toMatchObject({
      target: "actions.output",
      type: "panelActions",
    });
    expect(
      appAcceptance.find((entry) => entry.id === "output.export"),
    ).toMatchObject({
      actionCoverage: ["export.image"],
      evidence: "exported-bytes",
      exportArtifactCoverage: "all-required-image-export-behavior",
      target: "actions.output",
    });
  });

  it("declares the infinity canvas mode contract", () => {
    expect(
      appAcceptance.find((entry) => entry.id === "canvas.infinity.mode"),
    ).toMatchObject({
      evidence: "viewport-side-effect",
      infinityCanvasCoverage: "mode-and-restoration",
      kind: "runtime",
    });
  });

  it("declares the infinity scene-bounds image export contract", () => {
    expect(
      appAcceptance.find((entry) => entry.id === "canvas.infinity.export"),
    ).toMatchObject({
      evidence: "exported-bytes",
      infinityCanvasCoverage: "scene-bounds-image-export",
      kind: "runtime",
    });
  });

  it("does not imply timeline behavior before a product needs it", () => {
    expect(appSchema.assembly.capabilities).not.toContain("timeline.playback");
    expect(appSchema.assembly.capabilities).not.toContain("timeline.keyframes");
  });

  it("keeps the performance matrix on the runtime baseline", () => {
    expect(appPerformance.scenarios).toEqual([]);
    expect(appPerformance.workloadEnvelope).toEqual({ dimensions: [] });
  });

  it("declares production reload coverage for the product schema", () => {
    expect(appSchema.persistence.storage).toBe("localStorage");
    if (appSchema.persistence.storage !== "localStorage") {
      throw new Error("The product must persist user settings in localStorage.");
    }
    expect(appSchema.persistence.include).toContain("canvas");
    expect(
      appAcceptance.find((entry) => entry.id === "persistence.reload"),
    ).toMatchObject({
      automated: true,
      browser: true,
      evidence: "persistence-state",
      kind: "runtime",
      persistenceCoverage: "reload",
      persistenceSlices: appSchema.persistence.include,
      target: "canvas.size.width",
    });
    expect(validateProductAcceptanceCoverage()).toEqual([]);
  });
});
