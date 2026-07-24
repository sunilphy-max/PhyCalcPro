---
seoTitle: "Tolerance Stackup Calculator – Worst-Case, RSS & Monte Carlo Analysis"
seoDescription: "Analyze dimensional tolerance accumulation using worst-case, root-sum-square, and Monte Carlo methods for GD&T stack analysis and manufacturing planning."
guideHeadline: "Engineering guide to tolerance stackup analysis for assemblies"
keywords:
  - tolerance stackup calculator
  - worst case tolerance
  - RSS tolerance analysis
  - Monte Carlo simulation
  - GD&T stack analysis
  - dimensional variation
  - manufacturing tolerance
---

### Tolerance Stackup (`tolerance`)

## How engineers analyze tolerance accumulation

Every manufactured dimension has variation. When parts assemble into a chain of dimensions, individual tolerances accumulate — potentially preventing assembly or degrading function. Tolerance stackup analysis predicts the total variation at a critical assembly dimension using three methods: worst-case (all at extremes), RSS (statistical independence assumed), and Monte Carlo (simulated distribution). The results guide tolerance tightening or loosening decisions that balance cost and function.

## Analysis methods

| Method | Assumption | Result |
|--------|-----------|--------|
| Worst-case (WC) | All at simultaneous extremes | Maximum possible variation |
| Root-sum-square (RSS) | Independent, normal distributions | Statistical variation (3-sigma) |
| Monte Carlo (MC) | User-defined distributions | Simulated distribution of assembly |

## Engineering workflow

1. Identify the critical assembly dimension (gap, clearance, alignment).
2. Map the dimension chain: list every contributing part dimension.
3. Assign tolerance \( \pm t_i \) to each dimension from drawing or process capability.
4. Compute worst-case stackup: sum of absolute tolerances.
5. Compute RSS stackup: root of sum of squared tolerances.
6. Optionally run Monte Carlo with specified sample count and distribution type.
7. Compare assembly variation to functional requirements.
8. Tighten tolerances on sensitive dimensions; relax on non-critical dimensions.

## Key quantities and formulas

Worst-case total tolerance:

\[
T_{\text{WC}} = \sum_{i=1}^{n} |t_i|
\]

Root-sum-square tolerance:

\[
T_{\text{RSS}} = \sqrt{\sum_{i=1}^{n} t_i^2}
\]

Monte Carlo statistics:

\[
\mu_{\text{MC}} = \frac{1}{N}\sum_{j=1}^{N} x_j, \quad \sigma_{\text{MC}} = \sqrt{\frac{1}{N-1}\sum_{j=1}^{N}(x_j - \mu)^2}
\]

## Worked example

A five-part assembly chain with tolerances: 0.05, 0.10, 0.08, 0.03, 0.12 mm.

- Worst-case: \( T_{\text{WC}} = 0.05 + 0.10 + 0.08 + 0.03 + 0.12 = 0.38 \) mm.
- RSS: \( T_{\text{RSS}} = \sqrt{0.05^2 + 0.10^2 + 0.08^2 + 0.03^2 + 0.12^2} = \sqrt{0.0402} = 0.191 \) mm.
- The RSS result is roughly half the worst-case — this is the statistical advantage when tolerances are independent.
- If the functional requirement is 0.30 mm max gap variation, WC fails but RSS passes.

## Common mistakes and checks

- **Using RSS when tolerances are not independent:** correlated tolerances (same machine, same setup) do not obey RSS assumptions.
- **Ignoring thermal expansion:** temperature differences between measurement and service add systematic bias, not random variation.
- **Forgetting assembly shift:** positional tolerance zones shift the mean, not just the spread.
- **Not identifying the critical dimension:** analyzing the wrong stackup chain wastes effort and misses the real risk.
- **Over-tightening all tolerances:** tightening non-critical dimensions adds manufacturing cost without improving function.

## FAQ

### When should I use worst-case vs RSS?

Use worst-case for safety-critical applications where 100% conformance is required. Use RSS when statistical rejection rates are acceptable and tolerances are truly independent.

### How many Monte Carlo samples are needed?

At least 10,000 for reliable 3-sigma estimates; 100,000+ for tail probabilities (ppm reject rates).

### Can I mix tolerance distributions in Monte Carlo?

Yes — the Monte Carlo method supports uniform, normal, or other distributions per dimension. This is its main advantage over RSS.

### What is the Benderization factor?

A semi-empirical correction (typically 1.5) applied to RSS to account for non-normal distributions and mild correlations: \( T_{\text{Bender}} = 1.5 \times T_{\text{RSS}} \).

### How does GD&T relate to tolerance stackup?

GD&T defines tolerance zones geometrically. For stackup analysis, geometric tolerances must be converted to equivalent linear tolerances in the stack direction.

## Use the PhyCalcPro calculator

Open the [Tolerance Stackup calculator](/products/manufacturing/tolerance) to enter the array of tolerances, optional secondary direction, and Monte Carlo sample count. The tool returns worst-case total, RSS total, and Monte Carlo statistics with visualization.

---

**Purpose**

Analyze dimensional variation accumulation in assemblies using worst-case and statistical (RSS) methods, with optional Monte Carlo simulation.

**Physics & theory**

Each dimension in a chain contributes uncertainty \( \pm t_i \). Worst-case assumes all tolerances at simultaneous extremes: \( T_{\text{WC}} = \sum |t_i| \). RSS assumes independent normal distributions: \( T_{\text{RSS}} = \sqrt{\sum t_i^2} \). Monte Carlo draws random deviations per dimension and sums to build the assembly distribution.

**Governing equations**

\[
T_{\text{WC}} = \sum_{i=1}^{n} |t_i|
\]

\[
T_{\text{RSS}} = \sqrt{\sum_{i=1}^{n} t_i^2}
\]

\[
\mu_{\text{MC}} = \frac{1}{N}\sum_{j=1}^{N} x_j, \quad \sigma_{\text{MC}} = \sqrt{\frac{1}{N-1}\sum(x_j - \mu)^2}
\]

**Numerical method**

Closed-form WC and RSS. Optional Monte Carlo with uniform or normal sampling over `monteCarloSamples` iterations. Separate X/Y stacks when 2D variation is provided.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| `tolerances` | Array of plus/minus tolerances per dimension |
| `tolerancesY` (optional) | Secondary stack direction |
| `monteCarloSamples` | Simulation count (0 = skip) |
| Nominal stack direction | Additive chain definition |

**Outputs**

- Worst-case total, RSS total, Monte Carlo mean and standard deviation (if run), per-direction stacks.

**Design codes & checks**

- **Indicative:** Worst-case and RSS stack
- **US:** ASME Y14.5 dimensioning and tolerancing
- **ISO:** ISO 286 tolerance principles (related)

**Assumptions & limitations**

- Linear stack chains; no geometric tolerance zone conversion from GD&T.
- RSS assumes normal, independent variations — not valid for skewed processes.
- Monte Carlo quality depends on sample count and distribution assumptions.
- No assembly shift or thermal expansion unless added as dimensions.

**References**

1. ASME Y14.5-2018. *Dimensioning and Tolerancing*.
2. Wick, C. H., et al. *Tolerance Stack Up Analysis*, 2nd ed. ASME Press.
3. ISO 286-1:2010. *Limits and fits*.
4. Srinivasan, V. *Statistical Tolerance Analysis*. ASME Handbook.
