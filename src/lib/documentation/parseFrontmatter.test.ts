import { describe, expect, it } from "vitest";
import {
  extractFaqItems,
  extractTocHeadings,
  parseFrontmatter,
  stripLeadingModuleHeading,
} from "./parseFrontmatter";

describe("parseFrontmatter", () => {
  it("parses inline keywords array", () => {
    const raw = `---
seoTitle: "Bearing Selection Guide"
seoDescription: "How engineers select bearings"
guideHeadline: "How Engineers Select Bearings"
keywords: ["L10 life", "ISO 281"]
---

### Bearing Selection Guide (\`bearings\`)

## Engineering workflow
`;
    const { data, body } = parseFrontmatter(raw);
    expect(data.seoTitle).toBe("Bearing Selection Guide");
    expect(data.keywords).toEqual(["L10 life", "ISO 281"]);
    expect(body.startsWith("### ")).toBe(true);
  });

  it("parses multiline keywords lists", () => {
    const raw = `---
seoTitle: "Motor Sizing"
seoDescription: "Screen motors"
guideHeadline: "Motor guide"
keywords:
  - motor sizing
  - slip speed
---

### Motor Sizing (\`motor\`)
`;
    const { data } = parseFrontmatter(raw);
    expect(data.keywords).toEqual(["motor sizing", "slip speed"]);
  });
});

describe("extractTocHeadings / FAQ", () => {
  const md = `### Title (\`x\`)

## Engineering workflow
Steps

## FAQ
### What is L10?
Basic rating life at 90% reliability.

### What is C?
Dynamic load rating.

## Use the PhyCalcPro calculator
Open it.
`;

  it("extracts ## TOC entries", () => {
    const toc = extractTocHeadings(md);
    expect(toc.map((t) => t.title)).toEqual([
      "Engineering workflow",
      "FAQ",
      "Use the PhyCalcPro calculator",
    ]);
  });

  it("extracts FAQ Q&A", () => {
    const faq = extractFaqItems(md);
    expect(faq).toHaveLength(2);
    expect(faq[0]?.question).toBe("What is L10?");
    expect(faq[0]?.answer).toContain("90%");
  });

  it("strips leading module heading", () => {
    expect(stripLeadingModuleHeading(md).startsWith("## ")).toBe(true);
  });
});
