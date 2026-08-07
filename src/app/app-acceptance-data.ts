import type {
  ToolcraftComponentAcceptance,
  ToolcraftControlSectionInventoryEntry,
  ToolcraftProductReadiness,
  ToolcraftTransferMode,
} from "./acceptance/types";
import { appSchema } from "./app-schema";

const persistenceSlices =
  appSchema.persistence.storage === "localStorage"
    ? appSchema.persistence.include
    : [];

export const appTransferMode: ToolcraftTransferMode = {
  animationIntent: { mode: "none" },
  mode: "new-toolcraft-app",
};

export const appProductReadiness: ToolcraftProductReadiness = {
  exportIntent: {
    image: { mode: "toolcraft-default" },
    video: { mode: "not-requested" },
  },
  interactionOwnership: [
    {
      alternative: {
        reason:
          "Canvas drag-and-drop admission is runtime-owned; the panel fileDrop remains the authored owner of the source image collection.",
        surface: "canvas",
      },
      capability: "collection-edit",
      evidence: {
        detail:
          "The WZRD Image brief requires local image import through a file picker and drag-and-drop as the first step of the edit flow.",
        source: "user-request",
      },
      id: "source-image-import",
      reason:
        "Import, replacement, and removal of the single source image are structured collection edits that belong in the controls panel.",
      surface: "panel",
      target: "source.image",
    },
    {
      alternative: {
        reason:
          "There is no canvas gesture for artifact delivery; export is a discrete command that belongs in the sticky panel footer.",
        surface: "canvas",
      },
      capability: "command",
      evidence: {
        detail:
          "The WZRD Image brief requires a permanent Send/export action that delivers the edited image as a downloadable artifact.",
        source: "user-request",
      },
      id: "image-export-command",
      reason:
        "Final artifact export is a one-shot command surfaced as the sticky Output action.",
      surface: "panel",
      target: "actions.output",
    },
  ],
  mode: "product",
  productName: "WZRD Image",
  productSummary:
    "A single-image editor: import a local image, frame it on an editable canvas over a brand background, and export the result as an image artifact.",
  requestedBehavior:
    "Rebuild the WZRD image mini-app on the Toolcraft starter: import a local image, reframe it on the canvas, adjust the background, undo/redo through runtime history, and export/send the final image.",
  viewInteraction: {
    mode: "non-spatial",
    reason:
      "The product is a 2D image-editing surface with no 3D scene; canvas pan/zoom is workspace navigation, not model orbit.",
  },
};

export const appAcceptance: readonly ToolcraftComponentAcceptance[] = [
  {
    automated: true,
    automatedTestName: "declares the source image fileDrop contract",
    browser: true,
    browserTestName:
      "browser: source image upload, transform, removal, and reset drive the canvas media output",
    componentType: "fileDrop",
    evidence: "media-lifecycle",
    expectedObservable:
      "Uploading an image shows it as the canvas media layer at unchanged canvas size; rotate and flip change the rendered media; remove clears it; reset restores the empty default.",
    fixture: "generated PNG fixture with a mismatched aspect ratio",
    id: "source.image.upload",
    interactionId: "source-image-import",
    kind: "control",
    mediaLifecycleCoverage: [
      "upload",
      "rotate",
      "flip",
      "transform-output",
      "remove",
      "reset",
      "default-reset",
    ],
    target: "source.image",
    userAction:
      "Upload an image through the Source fileDrop, rotate and flip it, remove it, and reset to defaults.",
  },
  {
    automated: true,
    automatedTestName: "declares the background include switch contract",
    browser: true,
    browserTestName:
      "browser: background switch controls preview visibility and export transparency",
    componentType: "switch",
    evidence: "rendered-pixels",
    backgroundOutputCoverage: "all-required-background-output",
    expectedObservable:
      "Disabling the background hides it in the preview and exports transparent pixels; enabling restores the composited background color.",
    fixture: "default canvas with the brand background color",
    id: "background.enabled",
    kind: "control",
    target: "export.includeBackground",
    userAction: "Toggle the Background switch off and back on.",
  },
  {
    automated: true,
    automatedTestName: "declares the background color contract",
    browser: true,
    browserTestName:
      "browser: background color changes the rendered canvas pixels",
    componentType: "color",
    evidence: "rendered-pixels",
    expectedObservable:
      "Choosing a different background color visibly changes the canvas background pixels.",
    fixture: "default canvas with the brand background color",
    id: "background.color",
    kind: "control",
    target: "appearance.background",
    userAction: "Change the Background color control to a contrasting color.",
  },
  {
    automated: true,
    automatedTestName: "declares the image export format contract",
    browser: true,
    browserTestName:
      "browser: image export format selection changes the exported artifact encoding",
    componentType: "select",
    evidence: "exported-bytes",
    expectedObservable:
      "Selecting PNG or JPG produces an exported artifact with the matching encoding.",
    fixture: "default canvas output",
    id: "export.image.format",
    kind: "control",
    optionCoverage: "each-visible-item",
    target: "export.image.format",
    userAction: "Select each format option and export.",
  },
  {
    automated: true,
    automatedTestName: "declares the image export resolution contract",
    browser: true,
    browserTestName:
      "browser: image export resolution selection changes the exported artifact dimensions",
    componentType: "select",
    evidence: "exported-bytes",
    expectedObservable:
      "Selecting a resolution scales the exported artifact dimensions accordingly.",
    fixture: "default canvas output",
    id: "export.image.resolution",
    kind: "control",
    optionCoverage: "each-visible-item",
    target: "export.image.resolution",
    userAction: "Select each resolution option and export.",
  },
  {
    automated: true,
    automatedTestName: "declares the sticky export action contract",
    browser: true,
    browserTestName:
      "browser: the sticky Export PNG action delivers the runtime image artifact",
    componentType: "panelActions",
    evidence: "exported-bytes",
    actionCoverage: ["export.image"],
    exportArtifactCoverage: "all-required-image-export-behavior",
    expectedObservable:
      "Pressing Export PNG produces a downloaded image artifact matching the canvas output and the selected export settings.",
    fixture: "canvas with an uploaded source image",
    id: "output.export",
    interactionId: "image-export-command",
    kind: "control",
    target: "actions.output",
    userAction: "Press the sticky Export PNG action.",
  },
  {
    automated: true,
    automatedTestName: "declares the infinity canvas mode contract",
    browser: true,
    browserTestName:
      "browser: infinity canvas hides finite size controls and restores the dormant finite size",
    componentType: "runtime",
    evidence: "viewport-side-effect",
    expectedObservable:
      "Enabling Infinity canvas hides aspect ratio, width, and height controls and removes artboard clipping; disabling it restores the exact previous finite canvas size.",
    fixture: "default 1080x1080 finite canvas",
    id: "canvas.infinity.mode",
    infinityCanvasCoverage: "mode-and-restoration",
    kind: "runtime",
    target: "canvas.mode",
    userAction:
      "Toggle Infinity canvas on, observe the removed finite controls and clipping, then toggle it off.",
  },
  {
    automated: true,
    automatedTestName: "declares the infinity scene-bounds image export contract",
    browser: true,
    browserTestName:
      "browser: infinite image export crops to the union of visible scene elements",
    componentType: "runtime",
    evidence: "exported-bytes",
    expectedObservable:
      "Exporting while Infinity canvas is enabled produces an image cropped to the union of visible scene elements instead of a fixed artboard.",
    fixture: "infinity canvas with an uploaded source image",
    id: "canvas.infinity.export",
    infinityCanvasCoverage: "scene-bounds-image-export",
    kind: "runtime",
    target: "canvas.mode",
    userAction:
      "Enable Infinity canvas, position the source image, and press the sticky Export PNG action.",
  },
  {
    automated: true,
    automatedTestName:
      "declares production reload coverage for the product schema",
    browser: true,
    browserTestName:
      "browser: app restores exact canvas, values, and panel workspace slices after reload",
    componentType: "persistence",
    evidence: "persistence-state",
    expectedObservable:
      "Canvas size and zoom, their runtime values, and the moved and collapsed controls workspace remain visibly restored after a real browser reload.",
    fixture: "product runtime persisted workspace",
    id: "persistence.reload",
    kind: "runtime",
    persistenceCoverage: "reload",
    persistenceSlices,
    target: "canvas.size.width",
    userAction:
      "Edit Canvas width and zoom, move and collapse Controls, wait for persistence, and reload the page.",
  },
];

export const appControlSectionInventory: readonly ToolcraftControlSectionInventoryEntry[] =
  [
    {
      entity: "Source image",
      entityId: "source-image",
      groupingReason:
        "The single source image import is the product's one media entity and the first workflow step.",
      id: "source",
      targets: ["source.image"],
      title: "Source",
      workflowStage: "import",
    },
    {
      entity: "Canvas background",
      entityId: "canvas-background",
      groupingReason:
        "Background inclusion and color describe one composited background entity behind the image.",
      id: "background",
      targets: ["export.includeBackground", "appearance.background"],
      title: "Background",
      workflowStage: "style",
    },
    {
      entity: "Image export settings",
      entityId: "image-export",
      groupingReason:
        "Format and resolution are the two settings of the single exported image artifact.",
      id: "image-export",
      targets: ["export.image.format", "export.image.resolution"],
      title: "Image Export",
      workflowStage: "deliver",
    },
  ];
