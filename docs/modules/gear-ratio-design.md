### Gear Ratio Design (`gear-ratio-design`)

**Purpose**

Search integer tooth-count combinations to achieve a target speed ratio within specified tolerance. Optimizes for compactness, balanced wear, or minimum total teeth subject to interference and manufacturing constraints.

**Physics & theory**

Gear ratio for external spur gears is \( i = N_g/N_p = \omega_p/\omega_g \). Only integer tooth counts are manufacturable, so exact ratios are approximated: \( i_{\mathrm{actual}} = N_g/N_p \approx i_{\mathrm{target}} \). Error \( \epsilon = |i_{\mathrm{actual}} - i_{\mathrm{target}}|/i_{\mathrm{target}} \) must fall within tolerance for synchronized drives.

Minimum tooth counts avoid undercut in standard involute profiles (typically \( N \geq 17 \) for 20° pressure angle without profile shift). Hunting tooth combinations (where common factors of \( N_p \) and \( N_g \) exceed 1) distribute wear unevenly — coprime tooth counts are preferred for long life.

**Governing equations**

\[
i = \frac{N_g}{N_p}, \quad \epsilon = \frac{|N_g/N_p - i_{\mathrm{target}}|}{i_{\mathrm{target}}}
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
5. PhyCalcPro verification benchmarks in `src/data/verification/` where available for this module.
6. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
