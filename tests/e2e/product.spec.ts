import { test, expect } from "@playwright/test";

test.describe("Ficha de producto", () => {
  test("la ficha de una goma muestra specs y comentarios", async ({ page }) => {
    await page.goto("/product/butterfly-tenergy-05");
    await expect(page).toHaveTitle(/Tenergy 05/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Tenergy 05");
    // specs en placa técnica
    await expect(page.getByText("Especificaciones", { exact: false }).first()).toBeVisible();
    // botón comparar
    await expect(page.getByRole("button", { name: /Comparar este producto/ })).toBeVisible();
    // reviews (si existen)
    const reviewsHeading = page.getByRole("heading", { name: /Comentarios/ });
    if (await reviewsHeading.count()) {
      await expect(reviewsHeading.first()).toBeVisible();
    }
  });

  test("la marca enlaza a su página", async ({ page }) => {
    await page.goto("/product/butterfly-tenergy-05");
    await page.getByRole("link", { name: "Butterfly", exact: true }).click();
    await expect(page).toHaveURL(/\/marcas\/butterfly/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Butterfly");
  });
});
