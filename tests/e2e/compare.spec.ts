import { test, expect } from "@playwright/test";

test.describe("Comparador", () => {
  test("goma vs goma se compara correctamente", async ({ page }) => {
    const res = await page.goto("/compare/butterfly-tenergy-05-vs-yasaka-rakza-7");
    expect(res?.status()).toBe(200);
    await expect(page.getByText("Análisis comparativo")).toBeVisible();
    // botones quitar (uno por producto)
    await expect(page.getByRole("button", { name: /Quitar/ }).first()).toBeVisible();
  });

  test("el selector preselecciona desde la URL y muestra el contador", async ({ page }) => {
    await page.goto("/compare?a=butterfly-tenergy-05");
    // la goma viene preseleccionada (contador 1/4)
    await expect(page.getByText(/1 \/ 4 seleccionados/)).toBeVisible();
    // la tarjeta de Tenergy está marcada como seleccionada
    await expect(page.locator('button[aria-pressed="true"]').first()).toBeVisible();
  });

  test("goma vs madero se bloquea (404)", async ({ page }) => {
    const res = await page.goto("/compare/butterfly-tenergy-05-vs-butterfly-viscaria");
    expect([404, 400]).toContain(res?.status());
  });
});
