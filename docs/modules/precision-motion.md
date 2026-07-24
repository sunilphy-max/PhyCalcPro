---
seoTitle: "Precision Motion Calculator: Flexure Stiffness, Natural Frequency & Vibration Isolation"
seoDescription: "How engineers estimate flexure stiffness, natural frequency, thermal drift, and vibration isolation transmissibility for precision optomechanical and machine tool systems."
guideHeadline: "How Engineers Design Precision Motion Systems"
keywords: ["precision motion", "flexure stiffness", "natural frequency", "vibration isolation", "thermal drift", "transmissibility"]
---

### Precision Motion & Vibration (`precision-motion`)

## How engineers design precision motion systems

Precision instruments — coordinate measuring machines, lithography stages, optical mounts — demand sub-micrometre positioning accuracy. Three enemies threaten that accuracy: insufficient stiffness (compliance under load), vibration from the environment (floor, HVAC, adjacent equipment), and thermal drift from temperature changes. Engineers screen flexure stiffness, natural frequency, isolation transmissibility, and thermal drift to establish feasibility before detailed FEA and dynamic modelling.

This guide covers cantilever flexure mechanics, single-degree-of-freedom (SDOF) vibration isolation, and thermal dimensional stability.

## Precision motion challenges and design levers

| Challenge | Design lever | Key parameter |
|-----------|-------------|---------------|
| Compliance under load | Stiffer flexure or shorter span | \(k = 3EI/L^3\) |
| Low natural frequency | Increase stiffness or reduce mass | \(f_n = \frac{1}{2\pi}\sqrt{k/m}\) |
| Floor vibration coupling | Isolator with low \(f_n\) | Transmissibility \(TR\) |
| Thermal drift | Low-CTE material, temperature control | \(\delta = \alpha L \Delta T\) |
| Abbe error | Minimise offset from measurement axis | Geometry, not modelled here |
| Damping | Viscoelastic, constrained-layer, eddy-current | \(\zeta\) |

## Engineering workflow

1. **Define accuracy budget** — total allowable error at the point of interest.
2. **Allocate error sources** — stiffness/load, thermal, vibration, Abbe, sensor.
3. **Size flexures** — compute stiffness and check that deflection under load is within budget.
4. **Compute natural frequency** — ensure it is well above (stiff mount) or well below (isolator) excitation frequencies.
5. **Evaluate isolation** — transmissibility at the dominant floor vibration frequency.
6. **Estimate thermal drift** — select low-CTE material or tighten temperature control.
7. **Iterate** — trade stiffness vs mass vs CTE vs cost until the error budget closes.

## Key quantities and formulas

Cantilever flexure tip stiffness:

\[
k = \frac{3\,E\,I}{L^3}
\]

Single-degree-of-freedom natural frequency:

\[
f_n = \frac{1}{2\pi}\sqrt{\frac{k}{m}}
\]

Thermal drift:

\[
\delta_{\mathrm{th}} = \alpha\,L\,\Delta T
\]

Base-excitation transmissibility:

\[
TR = \sqrt{\frac{1 + (2\zeta r)^2}{(1 - r^2)^2 + (2\zeta r)^2}}
\]

where \(r = f_{\mathrm{exc}} / f_n\) is the frequency ratio and \(\zeta\) is the damping ratio.

Isolation condition: \(TR < 1\) requires \(r > \sqrt{2}\), i.e., the excitation frequency must exceed \(\sqrt{2}\,f_n\).

## Worked example

**Given:** Optical mount — cantilever flexure in Invar (E = 141 GPa, \(\alpha = 1.2 \times 10^{-6}\) /°C). Flexure: 20 mm long, 5 mm wide, 0.5 mm thick. Moving mass 0.2 kg. Room temperature controlled to \(\pm 0.5\) °C. Floor vibration at 15 Hz. Damping ratio \(\zeta = 0.02\).

1. Inertia: \(I = 5 \times 0.5^3 / 12 = 0.052\) mm\(^4\) = \(5.2 \times 10^{-14}\) m\(^4\).
2. Stiffness: \(k = 3 \times 141 \times 10^9 \times 5.2 \times 10^{-14} / (0.02)^3 = 2{,}752\) N/m.
3. Natural frequency: \(f_n = (1/2\pi)\sqrt{2752/0.2} = 18.7\) Hz.
4. Frequency ratio at 15 Hz: \(r = 15/18.7 = 0.80\). Transmissibility: \(TR \approx 2.6\) — amplification, not isolation. The mount resonance is too close to the floor vibration.
5. Thermal drift over 100 mm reference length: \(\delta = 1.2 \times 10^{-6} \times 0.1 \times 0.5 = 0.06\) \(\mu\)m — acceptable for micron-level work.

**Fix:** Lower the mount's natural frequency (add mass or soften the flexure) or raise it well above 15 Hz (stiffen the flexure and reduce mass). For \(r > \sqrt{2}\) at 15 Hz, need \(f_n < 10.6\) Hz — add an isolation pad.

## Common mistakes and checks

- Designing a flexure mount near the **floor vibration frequency** — creates resonant amplification instead of isolation.
- Ignoring **Abbe error** — angular errors multiplied by offset distance dominate in many practical systems.
- Using **aluminium** for thermal stability — its CTE (\(23 \times 10^{-6}\)) is 20× that of Invar or Zerodur.
- Forgetting **gravity sag** — a horizontal cantilever deflects under its own weight, consuming error budget.
- Assuming **single-axis behaviour** — real flexures have parasitic motions in secondary axes.
- Neglecting **creep in flexures** — high-stress flexures near yield can exhibit time-dependent drift.

## FAQ

### What is transmissibility and when is it less than 1?

Transmissibility \(TR\) is the ratio of response amplitude to base excitation amplitude. \(TR < 1\) (isolation) occurs when the excitation frequency exceeds \(\sqrt{2} \times f_n\). Below that, the isolator amplifies vibration — worst at \(r = 1\) (resonance).

### How do I choose between a stiff mount and a soft isolator?

Stiff mounts (high \(f_n\)) work when disturbances are low-frequency and you need high static stiffness. Soft isolators (low \(f_n\)) work when floor vibration is the dominant source and static load is handled by preload or gravity.

### What materials minimise thermal drift?

Invar (\(\alpha \approx 1.2 \times 10^{-6}\)), Super Invar (\(\alpha \approx 0.3 \times 10^{-6}\)), Zerodur (\(\alpha \approx 0.05 \times 10^{-6}\)), and carbon-fibre composites (\(\alpha\) near zero along fibre). Cost and machinability trade against CTE.

### How accurate is the SDOF transmissibility model?

The SDOF model captures the dominant mode well for simple isolation systems. Multi-mode structures (granite-on-isolators, active tables) need frequency response function (FRF) measurement or multi-DOF models.

### What damping ratio is typical for precision isolators?

Passive rubber/elastomer: \(\zeta = 0.05\)–0.15. Air springs: \(\zeta = 0.01\)–0.05. Active systems with feedback: equivalent \(\zeta = 0.2\)–0.7.

## Use the PhyCalcPro calculator

Open the [Precision motion calculator](/products/advanced-systems/precision-motion). Enter flexure geometry and material, moving mass, thermal parameters, and excitation frequency with damping ratio. Review flexure stiffness, natural frequency, thermal drift, frequency ratio, and transmissibility.

**Purpose**

Estimate flexure stiffness, natural frequency, thermal drift, and vibration isolation transmissibility for precision optomechanical and machine tool subsystems. Supports early-stage compliance and isolation design.

**Physics & theory**

Cantilever flexure tip stiffness \(k = 3EI/L^3\). SDOF natural frequency \(f_n = \frac{1}{2\pi}\sqrt{k/m}\). Thermal drift \(\delta = \alpha L \Delta T\). Base-excitation transmissibility for damping ratio \(\zeta\) and frequency ratio \(r = f_{\mathrm{exc}}/f_n\): \(TR < 1\) indicates isolation above \(\sqrt{2}\,f_n\); near \(r \approx 1\), amplification occurs.

**Governing equations**

\[
k = \frac{3\,E\,I}{L^3}, \quad f_n = \frac{1}{2\pi}\sqrt{\frac{k}{m}}
\]

\[
\delta_{\mathrm{th}} = \alpha\,L\,\Delta T
\]

\[
TR = \sqrt{\frac{1 + (2\zeta r)^2}{(1 - r^2)^2 + (2\zeta r)^2}}
\]

**Numerical method**

Closed-form flexure, thermal, and SDOF transmissibility. Resonance warning when \(0.8 < r < 1.2\).

**Inputs**

| Parameter | Description |
|-----------|-------------|
| Elastic modulus, inertia, flexure length | Flexure geometry |
| Moving mass | Payload mass |
| CTE, reference length, temperature change | Thermal drift |
| Excitation frequency, damping ratio | Vibration isolation |

**Outputs**

- Flexure stiffness (N/m), natural frequency (Hz), thermal drift (m), frequency ratio, transmissibility.

**Design codes & checks**

- **Indicative:** Stiffness, natural frequency, transmissibility screening
- **ISO:** ISO 230 machine tool accuracy; ISO 20816 vibration context

**Assumptions & limitations**

- Single cantilever flexure; multi-axis flexure systems not modelled.
- SDOF isolation; no multi-mode or active control.
- Linear elasticity; flexure stress limits not checked.
- Abbe error and motion cross-coupling omitted.

**References**

1. Smith, S. T., & Chetwynd, D. G. *Foundations of Ultraprecision Mechanism Design*. Gordon and Breach.
2. Slocum, A. H. *Precision Machine Design*. SME.
3. ISO 230-1:2012. *Test code for machine tools — Geometric accuracy*.
4. Rao, S. S. *Mechanical Vibrations*, 6th ed., transmissibility chapter.
