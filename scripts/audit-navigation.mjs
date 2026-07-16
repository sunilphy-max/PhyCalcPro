import { chromium } from "playwright";

const url = process.argv[2] ?? "http://localhost:3000/products/structural/beams";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(4000);

const audit = await page.evaluate(() => {
  const sidebar = document.querySelector("aside.products-sidebar");
  const workflow = document.querySelector('[aria-label="Continue workflow"]');
  const results = [];

  function hitTest(label, x, y) {
    const el = document.elementFromPoint(x, y);
    return {
      label,
      x,
      y,
      tag: el?.tagName,
      className: String(el?.className || "").slice(0, 120),
      text: el?.textContent?.slice(0, 40),
      isLink: el?.tagName === "A" || el?.closest("a")?.tagName === "A",
      inSidebar: sidebar?.contains(el),
    };
  }

  if (sidebar) {
    const r = sidebar.getBoundingClientRect();
    results.push(hitTest("category-bar", r.left + 120, r.top + r.height / 2));
  }

  const dropdown = document.querySelector("#products-module-dropdown");
  if (dropdown) {
    const r = dropdown.getBoundingClientRect();
    results.push(hitTest("dropdown-mid", r.left + 120, r.top + 80));
  }

  if (workflow) {
    workflow.querySelectorAll("a").forEach((a, i) => {
      const b = a.getBoundingClientRect();
      results.push(hitTest(`workflow-link-${i}`, b.left + b.width / 2, b.top + b.height / 2));
    });
  }

  const fixed = [...document.querySelectorAll("*")]
    .filter((el) => {
      const s = getComputedStyle(el);
      if (s.position !== "fixed" && s.position !== "sticky") return false;
      const z = parseInt(s.zIndex, 10);
      return !Number.isNaN(z) && z >= 20;
    })
    .map((el) => {
      const r = el.getBoundingClientRect();
      return {
        tag: el.tagName,
        cls: String(el.className).slice(0, 80),
        z: getComputedStyle(el).zIndex,
        pos: getComputedStyle(el).position,
        rect: { x: r.x, y: r.y, w: r.width, h: r.height },
      };
    });

  const widePlots = [...document.querySelectorAll(".js-plotly-plot, [data-export-plot]")].map((el) => {
    const r = el.getBoundingClientRect();
    return { cls: String(el.className).slice(0, 60), x: r.x, w: r.width, leftOfSidebar: r.x < 64 };
  });

  return { results, fixed, widePlots, url: location.href };
});

console.log("=== HIT TEST ===");
console.log(JSON.stringify(audit, null, 2));

const logs = [];
page.on("console", (m) => logs.push(`${m.type()}: ${m.text()}`));
page.on("pageerror", (e) => logs.push(`PAGEERROR: ${e.message}`));

// Open Structural category dropdown, then navigate via a module link.
const structuralBtn = page.locator('[aria-label="Structural Engineering modules"]').first();
if (await structuralBtn.count()) {
  await structuralBtn.click({ timeout: 5000 });
  await page.waitForTimeout(300);
}
const frameLink = page.locator("#products-module-dropdown a", { hasText: "Frame Analysis" });
if (await frameLink.count()) {
  await frameLink.scrollIntoViewIfNeeded();
  const href = await frameLink.getAttribute("href");
  const before = page.url();
  const tag = await frameLink.evaluate((el) => ({
    tag: el.tagName,
    href: el.getAttribute("href"),
    pointerEvents: getComputedStyle(el).pointerEvents,
  }));
  console.log("=== DROPDOWN LINK META ===");
  console.log(JSON.stringify(tag, null, 2));
  await frameLink.click({ timeout: 5000 });
  try {
    await page.waitForURL(`**${href}`, { timeout: 8000 });
    console.log("=== DROPDOWN NAV OK ===", page.url());
  } catch {
    console.log("=== DROPDOWN NAV FAILED ===");
    console.log(JSON.stringify({ before, after: page.url(), expected: href }, null, 2));
  }
}

await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(3000);

const wf = page.locator('[aria-label="Continue workflow"] a').first();
if (await wf.count()) {
  await wf.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  const href = await wf.getAttribute("href");
  const before = page.url();
  const box = await wf.boundingBox();
  const hit = box
    ? await page.evaluate(
        ({ x, y }) => {
          const el = document.elementFromPoint(x, y);
          return el
            ? {
                tag: el.tagName,
                href: el.closest("a")?.getAttribute("href"),
                text: el.textContent?.slice(0, 40),
              }
            : null;
        },
        { x: box.x + box.width / 2, y: box.y + box.height / 2 }
      )
    : null;
  console.log("=== WORKFLOW HIT ===", JSON.stringify(hit, null, 2));
  await wf.click({ timeout: 5000 });
  try {
    await page.waitForURL(`**${href}`, { timeout: 8000 });
    console.log("=== WORKFLOW NAV OK ===", page.url());
  } catch {
    console.log("=== WORKFLOW NAV FAILED ===");
    console.log(JSON.stringify({ before, after: page.url(), expected: href }, null, 2));
  }
}

if (logs.length) {
  console.log("=== CONSOLE ===");
  console.log(logs.slice(0, 30).join("\n"));
}

await browser.close();
