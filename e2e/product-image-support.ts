import {
  expect as playwrightExpect,
  type Download,
  type Locator,
  type Page,
} from "@playwright/test";

import {
  appAcceptance,
  appControlSectionInventory,
} from "../src/app/app-acceptance-data";
import { getToolcraftControlApplicabilityCases } from "../src/app/app-acceptance";
import { appSchema } from "../src/app/app-schema";
import {
  createToolcraftBrowserProofSession,
  type ToolcraftBrowserProofSession,
} from "./browser-proof-session";

const persistenceKey =
  appSchema.persistence.storage === "localStorage"
    ? appSchema.persistence.key
    : null;

if (persistenceKey === null) {
  throw new Error("The WZRD Image browser proofs require localStorage persistence.");
}

const resolvedPersistenceKey = persistenceKey;

export const backgroundRgba = [5, 7, 11, 255] as const;
export const fixtureFileName = "wzrd-fixture.svg";
export const fixtureSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="480"><rect width="480" height="240" fill="#FF0000"/><rect x="480" width="480" height="240" fill="#00FF00"/><rect y="240" width="480" height="240" fill="#0000FF"/><rect x="480" y="240" width="480" height="240" fill="#FFFF00"/></svg>`;
export const fixtureSceneRect = {
  height: 480,
  width: 960,
  x: -480,
  y: -240,
} as const;
export const quadrantPixels = [
  { rgba: [255, 0, 0, 255], xRatio: 0.25, yRatio: 0.25 },
  { rgba: [0, 255, 0, 255], xRatio: 0.75, yRatio: 0.25 },
  { rgba: [0, 0, 255, 255], xRatio: 0.25, yRatio: 0.75 },
  { rgba: [255, 255, 0, 255], xRatio: 0.75, yRatio: 0.75 },
] as const;
export const fullBounds = { height: 1, width: 1, x: 0, y: 0 } as const;

export async function openProofSession(
  page: Page,
): Promise<ToolcraftBrowserProofSession> {
  await page.goto("/");
  await page.evaluate((key) => localStorage.removeItem(key), resolvedPersistenceKey);
  await page.reload();
  return createToolcraftBrowserProofSession(page);
}

export async function uploadFixture(
  page: Page,
  fileName = fixtureFileName,
): Promise<void> {
  const source = page.locator(
    '[data-toolcraft-control-target="source.image"]',
  );
  await source.locator('input[type="file"]').setInputFiles({
    buffer: Buffer.from(fixtureSvg),
    mimeType: "image/svg+xml",
    name: fileName,
  });
  await playwrightExpect(
    page.locator("[data-canvas-media-layer] img"),
  ).toBeVisible();
}

export function getControl(page: Page, target: string): Locator {
  return page.locator(`[data-toolcraft-control-target="${target}"]`);
}

export async function setSwitch(
  page: Page,
  target: string,
  checked: boolean,
): Promise<void> {
  const control = getControl(page, target).locator('[role="switch"]');
  if ((await control.getAttribute("aria-checked")) !== String(checked)) {
    await control.click();
  }
  await playwrightExpect(control).toHaveAttribute(
    "aria-checked",
    String(checked),
  );
}

export async function selectOption(
  page: Page,
  target: string,
  optionLabel: string,
): Promise<void> {
  const combobox = getControl(page, target).getByRole("combobox");
  const option = page
    .locator('[role="option"]')
    .filter({ hasText: optionLabel })
    .first();
  await playwrightExpect
    .poll(async () => {
      if (await option.isVisible()) {
        return true;
      }
      await combobox.click();
      await page.waitForTimeout(250);
      return option.isVisible();
    })
    .toBe(true);
  await option.click();
  await playwrightExpect(combobox).toContainText(optionLabel);
}

export async function setBackgroundColor(
  page: Page,
  hex: string,
): Promise<void> {
  const input = getControl(page, "appearance.background").getByLabel(
    "Background color hex",
  );
  await input.fill(hex.replace("#", ""));
  await input.press("Enter");
}

export async function exportImage(page: Page): Promise<Download> {
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export PNG" }).click();
  return downloadPromise;
}

export function requireApplicabilityCase(
  target: string,
  selectorTarget: string,
  selectorValue: boolean | number | string,
) {
  const cases = getToolcraftControlApplicabilityCases({
    schema: appSchema,
    sectionInventory: appControlSectionInventory,
    target,
  });
  const found = cases.find(
    (candidate) =>
      candidate.selectorTarget === selectorTarget &&
      candidate.selectorValue === selectorValue,
  );
  if (!found) {
    throw new Error(
      `Missing applicability case ${target} / ${selectorTarget}=${String(selectorValue)}.`,
    );
  }
  return found;
}

export function requireAcceptanceRow(id: string) {
  const row = appAcceptance.find((candidate) => candidate.id === id);
  if (!row) {
    throw new Error(`Missing acceptance row "${id}".`);
  }
  return row;
}
