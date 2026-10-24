import { test, expect } from "@playwright/test";

// Maria's whole story, end to end, on an iPhone viewport.
// Default state is Maria's sample answers => income path, $612.

test("Maria's story runs end to end on a phone", async ({ page }) => {
  await page.goto("/");

  // Step 1 — Home
  await expect(
    page.getByText("Got a blue envelope from MassHealth?"),
  ).toBeVisible();
  // Footer disclaimer on every screen.
  await expect(
    page.getByText("Independent tool · Not MassHealth · Sample data"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Try a sample letter" }).click();

  // Step 2 — Letter X-Ray
  await expect(page.getByText("Here's what your letter says")).toBeVisible();
  await expect(
    page.locator(".letter .head").getByText("SAMPLE", { exact: true }),
  ).toBeVisible();
  // Deadline highlight + days-left pill present.
  await expect(page.getByText(/days left/)).toBeVisible();
  await page.getByRole("button", { name: "Check what applies to me" }).click();

  // Step 3 — Questions (Maria pre-filled)
  await expect(page.getByText("Let's find your easiest path")).toBeVisible();
  await expect(page.getByRole("button", { name: "19 to 64" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.getByRole("button", { name: "See my easiest path" }).click();

  // Step 4 — Path => income
  await expect(
    page.getByText("Your earnings may meet the income rule"),
  ).toBeVisible();
  await expect(page.getByText("$612.00").first()).toBeVisible();
  // Always-present decider note.
  await expect(
    page.getByText(/MassHealth makes the decision/),
  ).toBeVisible();
  // Use sample earnings screenshots => total $612.00.
  await page.getByRole("button", { name: "Use sample screenshots" }).click();
  await expect(page.getByText("Total for March")).toBeVisible();
  await page.getByRole("button", { name: "Build my proof packet" }).click();

  // Step 5 — Packet
  await expect(
    page.getByRole("heading", { name: "Your packet" }),
  ).toBeVisible();
  await expect(page.getByText("Due December 15, 2026")).toBeVisible();
  // Partner sign-off flow: none -> sent -> confirmed.
  await page.getByRole("button", { name: "Send sign-off link" }).click();
  await expect(page.getByText("Waiting for Riverside Food Pantry")).toBeVisible();
  await page
    .getByRole("button", { name: "Show the pantry confirming (demo)" })
    .click();
  await expect(page.getByText("22 volunteer hours confirmed")).toBeVisible();
  await page.getByRole("button", { name: "How to send it" }).click();

  // Step 6 — Submit
  await expect(page.getByText("Send your proof to MassHealth")).toBeVisible();
  await expect(page.getByText("2-1-1")).toBeVisible();
  await expect(
    page.getByText(/MassHealth makes the decision/),
  ).toBeVisible();
});

test("switching language changes the home headline", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByText("Got a blue envelope from MassHealth?"),
  ).toBeVisible();
  await page.getByLabel("Language").selectOption("pt");
  await expect(
    page.getByText("Recebeu um envelope azul do MassHealth?"),
  ).toBeVisible();
});

test("changing answers to no activity shows the short path", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Try a sample letter" }).click();
  await page.getByRole("button", { name: "Check what applies to me" }).click();

  // Turn work off so income no longer passes; volunteer 22h alone => short.
  await page.getByLabel("Paid work, including gig work").uncheck();
  await page.getByRole("button", { name: "See my easiest path" }).click();

  await expect(page.getByText(/hrs/)).toBeVisible();
  await expect(page.getByText(/close the gap/)).toBeVisible();
});
