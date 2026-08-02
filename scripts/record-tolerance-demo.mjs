/**
 * Records a short walkthrough video of the Tolerance Stackup module.
 * Requires: npm run dev (or BASE_URL), and: npx playwright install chromium
 *
 * Output: public/samples/PhyCalcPro-tolerance-module-walkthrough.webm
 */
import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir, copyFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const samplesDir = path.join(root, "public", "samples");
const zipPath = path.join(samplesDir, "PhyCalcPro-tolerance-demo-package.zip");
const outWebm = path.join(samplesDir, "PhyCalcPro-tolerance-module-walkthrough.webm");
const videoTmp = path.join(root, ".tmp-tolerance-video");

const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:3000";

/** SI metres — match demo drawing intent */
function extractFor(fileName) {
  const base = {
    datums: [],
    features: [],
    frames: [],
    dimensions: [],
    fitCallouts: [],
    suggestedContributors: [],
    notes: [],
  };
  const pn = fileName.replace(/\.pdf$/i, "");
  if (pn.includes("SLV")) {
    return {
      ...base,
      metadata: { drawingNumber: "SLV-015", revision: "A", title: "Sleeve", units: "mm" },
      dimensions: [
        {
          id: "d-axial",
          label: "Axial length",
          nominal: 0.012,
          upperDeviation: 0.00002,
          lowerDeviation: -0.00002,
          confidence: 0.92,
          location: { sheet: "1", zone: "B2" },
        },
      ],
      frames: [
        {
          id: "fcf-perp",
          characteristic: "perpendicularity",
          zoneValue: 0.00003,
          materialCondition: "RFS",
          datumRefs: [{ datumId: "A" }],
          label: "Perp to A",
          confidence: 0.88,
        },
      ],
      datums: [{ id: "A", type: "plane", label: "Sleeve face" }],
    };
  }
  if (pn.includes("SPC")) {
    return {
      ...base,
      metadata: { drawingNumber: "SPC-020", revision: "A", title: "Spacer", units: "mm" },
      dimensions: [
        {
          id: "d-thick",
          label: "Thickness axial",
          nominal: 0.008,
          upperDeviation: 0.000015,
          lowerDeviation: -0.000015,
          confidence: 0.9,
          location: { sheet: "1", zone: "C1" },
        },
      ],
      notes: [],
    };
  }
  if (pn.includes("RET")) {
    return {
      ...base,
      metadata: { drawingNumber: "RET-030", revision: "A", title: "Retainer", units: "mm" },
      dimensions: [
        {
          id: "d-height",
          label: "Axial height",
          nominal: 0.006,
          upperDeviation: 0.00002,
          lowerDeviation: -0.00002,
          confidence: 0.91,
        },
      ],
    };
  }
  if (pn.includes("SHA")) {
    return {
      ...base,
      metadata: { drawingNumber: "SHA-100", revision: "A", title: "Shaft", units: "mm" },
      dimensions: [
        {
          id: "d-len",
          label: "Overall length",
          nominal: 0.065,
          upperDeviation: 0.00005,
          lowerDeviation: -0.00005,
          confidence: 0.93,
        },
        {
          id: "d-shoulder",
          label: "Shoulder-to-end axial",
          nominal: 0.042,
          upperDeviation: 0.00003,
          lowerDeviation: -0.00003,
          confidence: 0.9,
        },
      ],
      frames: [
        {
          id: "fcf-pos",
          characteristic: "position",
          zoneValue: 0.00004,
          isDiameterZone: true,
          materialCondition: "MMC",
          datumRefs: [{ datumId: "A" }, { datumId: "B" }],
          featureOfSizeId: "fos-j",
          label: "Journal position MMC",
          confidence: 0.85,
        },
      ],
      features: [
        {
          id: "fos-j",
          label: "Journal",
          nominal: 0.02,
          upperLimit: 0.02,
          lowerLimit: 0.019985,
          isInternal: false,
        },
      ],
      datums: [
        { id: "A", type: "plane", label: "Shoulder" },
        { id: "B", type: "axis", label: "Axis" },
      ],
      fitCallouts: [
        {
          id: "fit1",
          label: "Journal g6",
          nominal: 0.02,
          shaftLetter: "g",
          shaftGrade: 6,
          confidence: 0.8,
        },
      ],
    };
  }
  if (pn.includes("HOU")) {
    return {
      ...base,
      metadata: { drawingNumber: "HOU-210", revision: "A", title: "Housing", units: "mm" },
      dimensions: [
        {
          id: "d-bore-depth",
          label: "Bore depth axial",
          nominal: 0.04,
          upperDeviation: 0.0001,
          lowerDeviation: 0,
          isInternal: true,
          confidence: 0.9,
        },
      ],
      frames: [
        {
          id: "fcf-pos",
          characteristic: "position",
          zoneValue: 0.00005,
          isDiameterZone: true,
          materialCondition: "MMC",
          datumRefs: [{ datumId: "A" }],
          featureOfSizeId: "fos-bore",
          label: "Bore position MMC",
          confidence: 0.86,
        },
      ],
      features: [
        {
          id: "fos-bore",
          label: "Bore",
          nominal: 0.052,
          upperLimit: 0.05203,
          lowerLimit: 0.052,
          isInternal: true,
        },
      ],
      datums: [{ id: "A", type: "plane", label: "Mounting face" }],
    };
  }
  if (pn.includes("SA-SEAL")) {
    return {
      ...base,
      metadata: {
        drawingNumber: "SA-SEAL-3100",
        revision: "A",
        title: "Seal Cartridge Subassembly",
        units: "mm",
      },
      dimensions: [
        {
          id: "d-overall",
          label: "Cartridge overall length",
          nominal: 0.028,
          upperDeviation: 0.00005,
          lowerDeviation: -0.00005,
          confidence: 0.87,
        },
      ],
      notes: [
        "MAX GAP endplay within cartridge: 0.15 mm",
        "Stack contributors: SLV-015 + SPC-020 + RET-030",
        "Axial CLEARANCE between sleeve shoulder and retainer",
      ],
    };
  }
  // Assembly
  return {
    ...base,
    metadata: {
      drawingNumber: "ASM-DEMO-1000",
      revision: "A",
      title: "Main Assembly",
      units: "mm",
    },
    notes: [
      "MAX GAP axial float at bearing seat: 0.30 mm",
      "Check shaft-to-housing CLEARANCE after SA-SEAL-3100 install",
      "Axial endplay requirement: 0.05 to 0.30 mm",
    ],
  };
}

async function pause(page, ms) {
  await page.waitForTimeout(ms);
}

async function main() {
  if (!existsSync(zipPath)) {
    console.error("Demo ZIP missing. Run: node scripts/build-tolerance-demo-package.mjs");
    process.exit(1);
  }

  await rm(videoTmp, { recursive: true, force: true });
  await mkdir(videoTmp, { recursive: true });
  await mkdir(samplesDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: videoTmp, size: { width: 1440, height: 900 } },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  // Mock drawing extract so the walkthrough works without OPENAI_API_KEY
  await page.route("**/api/manufacturing/parse-drawing", async (route) => {
    const req = route.request();
    let fileName = "drawing.pdf";
    try {
      const fd = req.postDataBuffer();
      // multipart — best-effort filename from content
      const text = fd?.toString("latin1") ?? "";
      const m = text.match(/filename="([^"]+\.pdf)"/i);
      if (m) fileName = m[1];
    } catch {
      /* ignore */
    }
    const extract = extractFor(fileName);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        extract,
        warnings: ["Demo recording: mocked extract (deterministic walkthrough)."],
        source: "llm",
        pageCount: 1,
      }),
    });
  });

  console.log("Opening", `${BASE_URL}/products/manufacturing/tolerance`);
  await page.goto(`${BASE_URL}/products/manufacturing/tolerance`, {
    waitUntil: "networkidle",
    timeout: 120_000,
  });
  await pause(page, 1200);

  // Title in view
  await page.evaluate(() => window.scrollTo(0, 0));
  await pause(page, 800);

  // Upload demo ZIP
  const fileInput = page.locator('input[type="file"][accept*="zip"]').first();
  await fileInput.setInputFiles(zipPath);
  await pause(page, 1500);

  // Wait for Structure / BOM tree
  await page.getByRole("button", { name: "Structure" }).waitFor({ timeout: 15000 });
  await pause(page, 1000);

  // Highlight study name
  const nameInput = page.getByLabel("Study name");
  if (await nameInput.count()) {
    await nameInput.fill("Demo seal cartridge stack");
    await pause(page, 600);
  }

  // Extract all
  const extractAll = page.getByRole("button", { name: /Extract all/i });
  await extractAll.click();
  // Wait until button re-enables / extracting finishes
  await page.waitForTimeout(2500);
  for (let i = 0; i < 30; i++) {
    const label = await extractAll.textContent();
    if (label && !/Extracting/i.test(label)) break;
    await pause(page, 400);
  }
  await pause(page, 1500);

  // Scroll annotation library a bit
  await page.getByText("Annotation library").scrollIntoViewIfNeeded();
  await pause(page, 1500);

  // Build stacks
  await page.getByRole("button", { name: "Build stacks" }).click();
  await pause(page, 800);

  // Select SA in tree — may need Structure first to pick SA, or create SA stack with selected PN
  // Go back to structure, select SA-SEAL-3100
  await page.getByRole("button", { name: "Structure" }).click();
  await pause(page, 600);
  await page.getByRole("button", { name: /Seal Cartridge|SA-SEAL-3100/i }).first().click();
  await pause(page, 800);
  await page.getByRole("button", { name: "Build stacks" }).click();
  await pause(page, 800);

  await page.getByRole("button", { name: "+ SA stack" }).click();
  await pause(page, 1000);

  // Set requirement max ~0.15 mm
  const req = page.getByLabel(/Requirement max/i);
  if (await req.count()) {
    await req.fill("0.15");
    await pause(page, 500);
  }

  // Add first few candidates from builder
  const radios = page.locator('input[type="radio"][name="stack-candidate"]');
  const n = await radios.count();
  const toAdd = Math.min(3, n);
  for (let i = 0; i < toAdd; i++) {
    await radios.nth(i).check();
    await pause(page, 350);
    await page.getByRole("button", { name: "Add to chain" }).click();
    await pause(page, 500);
  }

  // Confirm + solve
  const confirm = page.getByText(/I confirm this tolerance chain/i);
  await confirm.click();
  await pause(page, 600);
  await page.getByRole("button", { name: /Solve confirmed stack/i }).click();
  await pause(page, 2000);

  // Scroll to results if visible
  await page.evaluate(() => window.scrollTo(0, 0));
  await pause(page, 800);
  const results = page.getByText(/Stackup results|Worst-case/i).first();
  if (await results.count()) {
    await results.scrollIntoViewIfNeeded();
    await pause(page, 2000);
  }

  // Assist tab
  await page.getByRole("button", { name: "Assist" }).click();
  await pause(page, 800);
  const cmd = page.getByPlaceholder(/propose stacks/i);
  if (await cmd.count()) {
    await cmd.fill("propose stacks");
    await pause(page, 400);
    await page.getByRole("button", { name: "Run" }).click();
    await pause(page, 1500);
  }

  const exportBtn = page.getByRole("button", { name: /Export DR packet/i });
  if (await exportBtn.count()) {
    await exportBtn.scrollIntoViewIfNeeded();
    await pause(page, 1200);
  }

  await pause(page, 1500);

  await context.close();
  await browser.close();

  // Playwright names video after page; find the webm in tmp
  const { readdir } = await import("node:fs/promises");
  const files = (await readdir(videoTmp)).filter((f) => f.endsWith(".webm"));
  if (!files.length) {
    console.error("No webm recorded in", videoTmp);
    process.exit(1);
  }
  await copyFile(path.join(videoTmp, files[0]), outWebm);
  await rm(videoTmp, { recursive: true, force: true });
  console.log("Wrote", outWebm);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
