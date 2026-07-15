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
    // Icon rail is ~4rem; sample near the rail center.
    results.push(hitTest("sidebar-top", r.left + 20, r.top + 150));
    results.push(hitTest("sidebar-mid", r.left + 20, r.top + 280));
    results.push(hitTest("sidebar-link-area", r.left + 20, r.top + 220));
  }

  const drawer = document.querySelector("#products-nav-drawer:not([hidden])");
  if (drawer) {
    const r = drawer.getBoundingClientRect();
    results.push(hitTest("drawer-mid", r.left + 80, r.top + 220));
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
    // Icon rail is 4rem (64px); plots should start to the right of it.
    return { cls: String(el.className).slice(0, 60), x: r.x, w: r.width, leftOfSidebar: r.x < 64 };
  });

  return { results, fixed, widePlots, url: location.href };
});

console.log("=== HIT TEST ===");
console.log(JSON.stringify(audit, null, 2));

const logs = [];
page.on("console", (m) => logs.push(`${m.type()}: ${m.text()}`));
page.on("pageerror", (e) => logs.push(`PAGEERROR: ${e.message}`));

// Open overlay catalog, then navigate via a module link.
const openCatalog = page.locator('[aria-controls="products-nav-drawer"]').first();
if (await openCatalog.count()) {
  await openCatalog.click({ timeout: 5000 });
  await page.waitForTimeout(300);
}
const frameLink = page.locator("#products-nav-drawer nav a", { hasText: "Frame Analysis" });
if (await frameLink.count()) {
  await frameLink.scrollIntoViewIfNeeded();
  const href = await frameLink.getAttribute("href");
  const before = page.url();
  const tag = await frameLink.evaluate((el) => ({
    tag: el.tagName,
    href: el.getAttribute("href"),
    pointerEvents: getComputedStyle(el).pointerEvents,
  }));
  console.log("=== SIDEBAR LINK META ===");
  console.log(JSON.stringify(tag, null, 2));
  await frameLink.click({ timeout: 5000 });
  try {
    await page.waitForURL(`**${href}`, { timeout: 8000 });
    console.log("=== SIDEBAR NAV OK ===", page.url());
  } catch {
    console.log("=== SIDEBAR NAV FAILED ===");
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
