import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Accesibilidad (axe-core WCAG 2.1 A/AA)", () => {
  test("portada sin violaciones críticas ni serias", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const serious = results.violations.filter((v) => v.impact === "critical" || v.impact === "serious");
    for (const v of serious) {
      console.log(`❌ ${v.id} (${v.impact}): ${v.help} — ${v.nodes.length} nodos`);
    }
    expect(serious).toEqual([]);
  });

  test("ficha de producto sin violaciones críticas ni serias", async ({ page }) => {
    await page.goto("/product/butterfly-tenergy-05");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const serious = results.violations.filter((v) => v.impact === "critical" || v.impact === "serious");
    for (const v of serious) {
      console.log(`❌ ${v.id} (${v.impact}): ${v.help} — ${v.nodes.length} nodos`);
    }
    expect(serious).toEqual([]);
  });
});
