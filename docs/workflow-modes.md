# Calculator workflow modes

Every engineering module exposes four **workflow modes** in the header. They change how the primary action button behaves and which panels appear — they do not change the underlying physics.

## Auto-design

**Purpose:** Size from your targets instead of starting from a fixed geometry.

1. Enter loads, limits, and safety factors (design targets) in the inputs panel.
2. Click **Auto-design** — the module ranks catalog or solver candidates, applies the best match, then validates.
3. Review updated geometry, utilization, charts, and code checks in the results.

**Maturity note:** On modules marked *workflow-only*, Auto-design changes the button label but does not auto-size yet — use **Validate** for analysis. On *catalog-backed* modules, Auto-design ranks catalog entries. On *solver-backed* modules, it runs a sizing search and applies the best candidate.

## Validate

**Purpose:** Run the forward solver on the geometry and loads already in the form.

1. Enter geometry, loads, material, and supports in the inputs panel.
2. Click **Validate** to run the forward solver.
3. Review numeric results, plots, and engineering checks for your design standard.

This is the default mode when you open a module.

## Compare

**Purpose:** Browse ranked sizing options before committing to one size.

1. Open **Sizing candidates & reference** to see ranked catalog or solver options.
2. Click **Apply** on a row to load that size into the form (switches to Validate).
3. Run **Validate** again to confirm the chosen option with full physics and code checks.

## Diagnose

**Purpose:** Diagnose failure risk and reliability / safety calculations.

1. Enter the installed geometry and actual operating loads in the inputs panel.
2. Click **Diagnose** to run the forward solver and risk screening.
3. Review failure modes, safety margins, and recommended adjustments.

Diagnose is a post-solve risk layer over existing safety factors and utilizations — it does not invent new physics.

---

## Application preset

The **Application preset** dropdown (when shown) sets screening context for your design standard: service factors, deflection limits, and reference standards. It does not replace module-specific inputs — it seeds design targets and, on some modules (e.g. bearings), catalog filters.

---

## Document status & export quality

Before exporting a PDF or sharing results, confirm the calculation is complete:

| Item | Meaning |
|------|---------|
| **Inputs complete** | All required fields have valid values. |
| **Solver run** | You have clicked Calculate / Validate at least once. |
| **Checks reviewed** | Engineering checks in the results panel have been read. |
| **Charts included** | Result plots are populated (where applicable). |
| **Assumptions noted** | Limitations from the module reference doc are understood. |

The export dialog uses this checklist internally. Full assumptions and limitations for each module are in [module documentation](/documentation/modules).

---

## Related

- [Full technical reference](/documentation/reference)
- [Browse modules](/documentation/modules)
