import { test, expect } from "@playwright/test";

test("landing page loads and links to Fan Assistant", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /see the crowd before it becomes a crisis/i })).toBeVisible();

  await page.getByRole("link", { name: /try the fan assistant/i }).click();
  await expect(page).toHaveURL(/\/fan-assistant/);
  await expect(page.getByRole("heading", { name: "Fan Assistant" })).toBeVisible();
});

test("chat input is keyboard-operable end to end", async ({ page }) => {
  await page.goto("/fan-assistant");
  const input = page.getByLabel("Message the Fan Assistant");
  await input.focus();
  await input.fill("Where is Section 214?");
  await page.keyboard.press("Enter");
  // We don't assert on AI content (no live key in CI) — only that the
  // user's turn renders, proving the form submits via keyboard alone.
  await expect(page.getByText("Where is Section 214?")).toBeVisible();
});

test("skip link is the first focusable element", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByText("Skip to main content")).toBeFocused();
});
