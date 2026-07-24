---
seoTitle: "Gear Ratio Design Calculator – Integer Tooth Count Search & Optimization"
seoDescription: "Find optimal integer tooth-count pairs for a target gear ratio within tolerance. Optimize for compactness, balanced wear, and minimum total teeth."
guideHeadline: "Engineering guide to gear ratio design and tooth count selection"
keywords:
  - gear ratio calculator
  - tooth count search
  - gear ratio optimization
  - hunting tooth design
  - coprime gear teeth
  - minimum teeth interference
  - gear ratio tolerance
---

### Gear Ratio Design (`gear-ratio-design`)

## How engineers select gear tooth counts

Every gear train begins with a ratio requirement — but gears can only have integer teeth. Finding the best integer pair that approximates the target ratio, avoids undercut, and distributes wear evenly is a combinatorial search problem. The gear ratio design module automates this search, ranking solutions by compactness, ratio accuracy, and hunting tooth preference.

## Optimization strategies

| Strategy | Objective |
|----------|-----------|
| Minimum total teeth | Smallest, lightest gear set |
| Coprime teeth | Even wear distribution (hunting tooth) |
| Minimum ratio error | Precision drives, timing |
| Target center distance | Fixed housing constraint |

## Engineering workflow

1. Define the target ratio \( i \) and acceptable error tolerance.
2. Set minimum and maximum tooth counts (minimum depends on pressure angle — typically 17 for 20 deg).
3. Choose optimization preference: minimum teeth, coprime, or center distance match.
4. Run the integer search across all valid tooth count pairs.
5. Review ranked results for ratio error, total teeth, and hunting tooth flag.
6. Select the best pair and pass tooth counts to the gear design or bevel gear module for stress checks.

## Key quantities and formulas

Gear ratio and error:

\[
i = \frac{N_g}{N_p}, \quad \epsilon = \frac{|N_g / N_p - i_{\text{target}}|}{i_{\text{target}}}
\]

Optimization objective:

\[
N_p + N_g \to \min \quad \text{subject to } \gcd(N_p, N_g) = 1
\]

Center distance:

\[
C = \frac{m(N_p + N_g)}{2}
\]

## Worked example

Target ratio 3.5:1 with tolerance 0.5%, module 2.5 mm, minimum teeth 17.

- Candidate: \( N_p = 20, N_g = 70 \): ratio = 3.500, error = 0.0%, total = 90, \( \gcd = 10 \) — not coprime.
- Candidate: \( N_p = 17, N_g = 60 \): ratio = 3.529, error = 0.83% — exceeds tolerance.
- Candidate: \( N_p = 18, N_g = 63 \): ratio = 3.500, error = 0.0%, total = 81, \( \gcd = 9 \) — not coprime.
- Candidate: \( N_p = 19, N_g = 67 \): ratio = 3.526, error = 0.75% — exceeds tolerance.
- Candidate: \( N_p = 20, N_g = 69 \): ratio = 3.450, error = 1.4% — exceeds.
- Best coprime within tolerance: \( N_p = 23, N_g = 81 \): ratio = 3.522, error = 0.6% — marginal. The 20/70 pair at exact ratio wins if wear distribution is addressed with profile shift.

## Common mistakes and checks

- **Ignoring minimum tooth count:** below 17 teeth at 20 deg pressure angle, involute undercut weakens roots.
- **Chasing exact ratios at high tooth counts:** total teeth above 120 increases size and cost — accept small ratio error.
- **Non-coprime teeth in precision drives:** repeating mesh patterns concentrate wear and noise at specific teeth.
- **Forgetting profile shift:** profile shift can rescue tooth counts below the undercut limit.

## FAQ

### What is a hunting tooth combination?

A hunting tooth pair has coprime tooth counts (\( \gcd = 1 \)), so every tooth on one gear eventually contacts every tooth on the mating gear, distributing wear evenly.

### Can this module search for internal gear pairs?

The current search covers external spur pairs. For internal or compound trains, manually set constraints.

### How does module affect the search?

Module does not change the ratio — it only scales physical size. The search operates on tooth counts only; module determines center distance from the selected pair.

### Why is ratio error expressed as a percentage?

Percentage error normalizes across different target ratios, making it easier to compare accuracy for drives from 1.5:1 to 10:1.

## Use the PhyCalcPro calculator

Open the [Gear Ratio Design calculator](/products/machine/gear-ratio-design) to enter the target ratio, tolerance, tooth count bounds, and preferences. The tool returns ranked tooth-count pairs with actual ratio, error, center distance, and hunting tooth flag.

---

**Purpose**

Search integer tooth-count combinations to achieve a target speed ratio within specified tolerance. Optimizes for compactness, balanced wear, or minimum total teeth subject to interference and manufacturing constraints.

**Physics & theory**

Gear ratio for external spur gears is \( i = N_g/N_p \). Only integer tooth counts are manufacturable, so exact ratios are approximated. Minimum tooth counts avoid undercut in standard involute profiles (typically \( N \geq 17 \) for 20 deg pressure angle). Coprime tooth counts distribute wear evenly for long life.

**Governing equations**

\[
i = \frac{N_g}{N_p}, \quad \epsilon = \frac{|N_g/N_p - i_{\text{target}}|}{i_{\text{target}}}
\]

\[
N_p + N_g \to \min \quad \text{subject to } \gcd(N_p, N_g) = 1
\]

**Numerical method**

Exhaustive or bounded integer search over tooth count ranges. Filters candidates by minimum teeth, interference, and ratio error. Ranks solutions by total teeth, center distance, or hunting tooth preference.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| `targetRatio` | Desired \( i \) |
| `tolerance` | Maximum ratio error |
| `minTeeth`, `maxTeeth` | Search bounds |
| `module` | For center distance estimate |
| Preferences | Min total teeth, coprime requirement |

**Outputs**

- Ranked tooth-count pairs, actual ratio, ratio error, center distance, hunting tooth flag.

**Design codes & checks**

- **Indicative:** Ratio error screening

**Assumptions & limitations**

- External spur pair; internal or compound trains not searched.
- No profile shift or helical overlap considered.
- Center distance assumes standard involute with zero backlash.
- Does not verify bending/contact capacity — use Gear Design module.

**References**

1. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, 11th ed., Ch. 13.
2. AGMA 917-B97. *Design Manual for Parallel Shaft Fine-Pitch Gearing*.
3. ISO 21771:2007. *Cylindrical involute gears and gear pairs — Concepts*.
4. Buckingham, E. *Analytical Mechanics of Gears*. Dover.
