# Implementation Worklog

This file records product decisions and the evidence behind them. Keep it short, factual, and current. Update it after schema, renderer, timeline, layer, export, performance, or acceptance decisions.

## Status

Mode: product

This folder is the WZRD Image product: a single-image editor that imports a local image, frames it on an editable canvas over a brand background, and exports the result as an image artifact.

## Automatic Delivery Lifecycle

Keep this worklog human-shaped. For the first product delivery, record the request, decisions, state/output mapping, reference evidence, rejected alternatives, and known risks; one bare `pnpm verify:delivery` derives complete contract proof, one build, full functional acceptance, and no measured performance. For later `functional-targeted` delivery, record only the new intent and decisions; the same bare command derives exact ownership-required proof from protected state.

Classifier output establishes complaint authority only and never path localization. A localized performance complaint adds the domain authority below, then one bare `pnpm verify:delivery` runs one targeted iteration. If localization remains unresolved regardless of classifier result, ask one user-facing question naming visible operations and offering targeted diagnosis or a complete review; record neither `performance-iteration` intent nor canonical path authority until the answer supplies exact localization evidence. Never ask the user to choose internal path IDs. A broad or honestly unlocalizable problem may present that single choice with a recommendation for complete review, but the user still chooses. A direct complete-review request needs no further clarification. The full audit remains separate and requires an explicit operator request or accepted offer before `pnpm verify:perf` may run. Protected receipts own changed files, plans, checks, reports, measurements, and pass/fail evidence.

When `canvas.renderScale` is enabled, record the renderer decision to preserve selected backing quality and map it to functional `renderScaleCoverage` for interaction and steady state, plus playback when timeline is enabled. The worklog may name the protected `canvas-render-scale-backing` recipe, but it cannot claim its evidence or turn a quality failure into performance authority.

## Performance Iteration Entry Contract

For high-confidence ordinary work, record `Performance intent: ordinary-product-work`. For unresolved localization, whether classification returned high-confidence `performance-iteration` or `needs-agent-judgment`, record the unresolved visible operation but no `Performance intent: performance-iteration` field or `Performance paths` until the user's one clarification provides exact localization. For a localized performance complaint or post-clarification targeted choice, record exactly these domain fields in the latest iteration:

```md
- Performance intent: performance-iteration
- Performance request evidence: "<verbatim exact Request quote>"
- Performance paths: ["performance-path:%5B...%5D"]
- Verification: One bare `pnpm verify:delivery` will derive and run the protected proof.
```

The quoted evidence must be an exact nontrivial raw substring of `Request` with identical whitespace and Unicode code units. `Performance paths` must be a non-empty unique JSON array of canonical path IDs. Do not record command arguments, changed-file inventory, executed checks, reports, or measurements; the protected planner and receipt own that machine evidence. Each localized complaint or post-clarification targeted choice authorizes one bounded iteration; after it passes, return the app and wait for user evaluation. Classifier output or complaint evidence alone never supplies path localization or authorizes full certification. The separate operator command is permitted only after the user explicitly requests a complete audit or explicitly accepts the agent's offer; the user does not need to name the command.

## Decision Trail

### Iteration 1 — WZRD Image product delivery

- Request: Rebuild the WZRD image mini-app on the Toolcraft starter (defineToolcraft/ToolcraftApp) in MiniApps: import a local image, reframe it on the canvas, adjust the background, undo/redo through runtime history, and export/send the final image.
- Task type: Generated-app product delivery on the neutral starter.
- User-visible result: The app opens as WZRD Image with a Source fileDrop, a Background pair (include switch plus brand color), Image Export settings (format, resolution), and a sticky Export PNG action. Uploading an image renders it as the runtime media layer on the editable 1080×1080 canvas; runtime image transform actions rotate and flip it; undo/redo works through the runtime toolbar; export downloads the composited artifact.
- Source/reference checked: The user-supplied WZRD Image specification (`goal-image.md` in the original repository) and the prior hand-built Phase 1 implementation in `wzrd-studio-desktopfinal` were used as behavior sources; local Toolcraft docs and starter contracts were used as the implementation contract.
- Reference inputs: The WZRD Image specification and the user's explicit selection to rebuild on the Toolcraft starter in a `MiniApps` repository.
- Docs/contracts read: `workflow.md`, `core/runtime-boundary.md`, `core/control-selection.md`, `core/layout.md`, `core/setup-export.md`, `core/media-upload.md`, `schema-reference.md`, `renderer-technique.md`, `acceptance-testing.md`, `component-rules.md`, `assembly-workflow.md`.
- Contract rules applied: `runtime-shell-required`, `controls-product-coverage`, `controls-section-inventory-required`, `interaction-surface-ownership`, `output-export-required`, `acceptance-product-observable`, `persistence-policy-explicit`.
- View interaction intent: `non-spatial` — a 2D image-editing surface with no 3D scene; canvas pan/zoom is workspace navigation.
- Interaction ownership: The panel owns source-image import (fileDrop) and the sticky export command; runtime canvas drag-and-drop admission complements the panel fileDrop without mirroring a product operation.
- Decision: Ship the Phase 1 reframe-and-share slice entirely on runtime-owned capabilities: runtime media layer for the uploaded image, runtime image transform actions for rotate/flip, runtime canvas sizing (editable-output, 1080×1080 default) for reframing, runtime history for undo/redo, and runtime typed `export-image` for delivery. Product code adds only a preview-only empty-state background layer in `canvasContent`, the matching required `exportRenderer` declaration (a no-op frame because the runtime composites the background into exports), and a `sceneBoundsProvider` that crops infinite export to visible image rects.
- Alternatives rejected: Copying the hand-built MiniShell/CanvasStage/HistoryFormatBar shell (violates the runtime boundary); a custom Canvas 2D renderer for straighten/style filters (deferred until those product behaviors are requested, to avoid an unneeded renderer pipeline); product-owned export canvases or download flows (runtime owns typed image export).
- State/output mapping: `source.image` holds the uploaded media reference rendered by the runtime media layer; `export.includeBackground` and `appearance.background` drive the composited background in preview and export; `export.image.format`/`export.image.resolution` drive artifact encoding and dimensions; `actions.output` triggers runtime-owned image export of the visible canvas.
- Performance intent: ordinary-product-work
- Verification: One bare `pnpm verify:delivery` will derive and run the protected proof.
- Risks: Straighten, crop presets beyond runtime aspect sizing, retouch, and style presets from the WZRD specification are deferred to a later iteration that will introduce a custom renderer; the current slice intentionally covers import, reframe, background, history, and export only.

## Decisions

### Renderer

- Decision: No custom renderer pipeline; the runtime media layer renders the uploaded source image. `canvasContent` carries only the DOM background layer shown while the finite canvas is empty and Background is included; `exportRenderer.renderFrame` is intentionally a no-op because runtime background composition already paints the export, and `sceneBoundsProvider` derives infinite-export bounds from visible image rects (rotation-aware).
- Reason: Every pixel-producing behavior in this delivery (media display, transforms, background compositing, encoding) is runtime-owned; a custom renderer would add an unrequired pipeline.
- Evidence: The composition declares `modelPresentation: { mode: "runtime" }`, `canvasContent: <WzrdBackgroundLayer />`, and `sceneBoundsProvider`; the uploaded image is visible through the runtime media layer and export pixels are proved in the browser suite.

### Timeline

- Decision: No timeline.
- Reason: The product is a still-image editor with no animation behavior.
- Evidence: `panels.timeline` is omitted and `animationIntent` is `none`.

### Layers

- Decision: No layers.
- Reason: The product edits exactly one source image; there is no multi-layer workflow.
- Evidence: `panels.layers` is omitted; the single `source.image` fileDrop owns the media lifecycle.

### Controls

- Decision: Four product sections grouped by entity: Source (fileDrop), Background (switch plus color), Image Export (format, resolution), Output (sticky export action).
- Reason: Each section maps to one product entity in workflow order — import, style, deliver — and every control uses a built-in type with explicit `always` applicability.
- Evidence: `appControlSectionInventory` declares one entry per section with exact targets.

### View Interaction

- Decision: `non-spatial`.
- Reason: The product is a 2D editing surface with no editable spatial scene.
- Evidence: Product readiness declares the typed `viewInteraction` with reason; no `orientationGizmo` exists.

### Interaction Ownership

- Decision: The panel owns source import and the export command; the canvas owns only runtime workspace navigation.
- Reason: Import and export are structured/discrete operations without a natural canvas gesture; no operation is mirrored across surfaces.
- Evidence: `interactionOwnership` entries `source-image-import` and `image-export-command` in product readiness.

### Export

- Decision: One sticky typed `export-image` action (`Export PNG`) with a runtime-owned Image Export settings section.
- Reason: The product delivers a single image artifact; runtime owns encoding, resolution scaling, and download.
- Evidence: The Output section declares the `panelActions` control with `role: "export-image"` and the Image Export section declares `export.image.format` and `export.image.resolution`.

### Performance

- Decision: No custom renderer workload; the performance matrix remains the runtime baseline with no product scenarios.
- Reason: All rendering is runtime-owned media/background compositing; the product adds no per-frame work.
- Evidence: `app-performance.ts` declares `rendererStrategy: "none"` and `usesCustomRenderer: false`.

## Evidence

- Source reviewed: WZRD Image specification, prior Phase 1 implementation behavior, product schema, acceptance data, and local Toolcraft docs.
- Contract applied: runtime boundary preserved — product code supplies schema, metadata, a preview-only empty-state background layer in `canvasContent`, and a `sceneBoundsProvider` for infinite export; media, transforms, history, persistence, and export remain runtime-owned.
- Product browser proofs: `e2e/product-image.spec.ts` (source media lifecycle, background switch/export transparency, background color pixels), `e2e/product-image-export.spec.ts` (format encoding, resolution dimensions, sticky export artifact, Infinity mode/restoration, infinite scene-union export), and the runtime persistence proof in `e2e/app-persistence.spec.ts` all pass locally against the dev server.

## Verification

Protected receipts own changed files, the derived plan, commands, selectors, reports, measurements, and pass/fail evidence. Decision Trail iterations record only one bare `pnpm verify:delivery` narrative.

## Risks

- Risk: Straighten, crop presets, retouch, and style behaviors from the WZRD specification are not yet implemented; they require a future iteration with a custom renderer decision.
- Risk: Export fidelity depends on runtime background compositing; the transparent-export path is proved by the background acceptance row.
- Baseline issue (inherited from the pristine Toolcraft starter, reproduced against an unmodified starter copy): the Node test `finds built-in controls through every module form` fails with a classification-order mismatch in `npm run test`. The failure is not caused by product code, no protected framework file was modified to work around it, and the protected `pnpm verify:delivery` gate passes in full (docs, code health, 397 Vitest tests, build, and all nine registered browser proofs).
