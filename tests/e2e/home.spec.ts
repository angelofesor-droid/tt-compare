import { test, expect } from "@playwright/test";

test.describe("Homepage y navegación", () => {
  test("la portada carga con el wordmark y tarjetas de producto", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Zona");
    // hay tarjetas de producto (enlaces a fichas)
    const links = page.locator('a[href^="/product/"]');
    await expect(links.first()).toBeVisible();
    // nav principal
    await expect(page.getByLabel("Principal").getByRole("link", { name: "Gomas" })).toBeVisible();
  });

  test("las páginas de categoría cargan con productos", async ({ page }) => {
    for (const route of ["/rubbers", "/blades", "/tables", "/marcas", "/guias"]) {
      const res = await page.goto(route);
      expect(res?.status()).toBe(200);
    }
    await page.goto("/rubbers");
    await expect(page.locator('a[href^="/product/"]').first()).toBeVisible();
  });

  test("la búsqueda full-text encuentra productos", async ({ page }) => {
    await page.goto("/search?q=dignics");
    await expect(page.getByRole("link", { name: /Dignics 09C/ }).first()).toBeVisible();
  });
});
