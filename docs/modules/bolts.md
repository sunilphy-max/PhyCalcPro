---
seoTitle: "Bolt & Fastener Calculator – Preload, Joint Diagram & VDI 2230 Analysis"
seoDescription: "Analyze bolted joints with preload, proof load, joint stiffness diagram, VDI 2230 worksheet, and combined tension-shear interaction using PhyCalcPro."
guideHeadline: "Bolted Joint Design — Preload, Proof Load & Joint Diagram Guide"
keywords: ["bolt calculator", "preload", "VDI 2230", "joint diagram", "proof load", "bolted joint", "torque-tension", "bolt stiffness"]
---

### Bolted Joint Design Guide (`bolts`)

## How engineers analyze bolted joints

Bolted connections are the most common mechanical fastening method, yet they are frequently under-designed because engineers focus only on tensile stress and ignore the mechanics of clamping. A properly designed bolted joint is a *preloaded spring system* — the bolt acts as a tension spring and the clamped members act as compression springs. Understanding this stiffness interaction is the key to joint reliability.

The design process involves:

1. **Selecting a bolt grade** whose proof load exceeds the maximum bolt load under service conditions.
2. **Setting preload** high enough to maintain clamp force under external loads, thermal effects, and embedding relaxation.
3. **Checking combined tension and shear** when shear loads are present.
4. **Verifying the joint does not separate** — loss of clamping force leads to fatigue failure, leakage, or loosening.

## Types and configurations

| Joint type | Load path | Design approach |
|---|---|---|
| Tension joint (non-gasketed) | External load along bolt axis | Stiffness-based preload design |
| Tension joint (gasketed) | Axial load with gasket sealing | VDI 2230 with embedding and gasket creep |
| Shear joint (bearing) | Transverse load through bolt shank | Bolt in single/double shear |
| Friction-grip (slip-critical) | Transverse load via clamped friction | High preload, surface prep |
| Combined tension + shear | Both load paths active | Interaction ellipse per AISC J3 or VDI |

## Engineering workflow

1. **Determine service loads** — External tensile load \( F_e \), shear load \( F_s \), and any bending or prying at the connection.
2. **Select bolt size and grade** — Choose diameter \( d \) and property class (e.g., 10.9, Grade 8) so that proof load \( F_p = S_p \times A_t \) exceeds the maximum anticipated bolt load with margin.
3. **Compute joint stiffness** — Bolt stiffness \( k_b = A_t E / l_g \) and member stiffness \( k_m \) from frustum cone analysis or Shigley approximation.
4. **Set preload** — Target 75–90 % of proof load for non-permanent connections. Account for tightening method scatter (torque wrench \( \pm 25\% \), turn-of-nut \( \pm 15\% \), tensioner \( \pm 5\% \)).
5. **Build joint diagram** — Plot bolt load and member load vs. external load; verify clamp force remains positive under maximum service load.
6. **Check fatigue** — Alternating bolt stress \( \Delta\sigma = \Delta F_b / A_t \) must be below the endurance limit for the bolt (typically 50–60 MPa for rolled threads in Class 10.9).
7. **Verify separation** — The external load at which clamp is lost: \( F_{\mathrm{sep}} = F_i (k_b + k_m)/k_m \).

## Key quantities and formulas

**Bolt load under external tension (joint diagram)**

\[
F_b = F_i + \frac{k_b}{k_b + k_m}\,F_e = F_i + \Phi\,F_e
\]

where \( \Phi = k_b/(k_b + k_m) \) is the load introduction factor (typically 0.15–0.35 for steel-on-steel).

**Torque-tension relationship**

\[
T = K\,F_i\,d
\]

Nut factor \( K \approx 0.20 \) for as-received steel, \( K \approx 0.15 \) for lubricated, \( K \approx 0.12 \) for anti-seize.

**Proof load and tensile stress**

\[
F_p = S_p \times A_t, \quad \sigma_t = \frac{F_b}{A_t}
\]

where \( A_t \) is the tensile stress area based on the mean of pitch and minor diameters.

**Separation load**

\[
F_{\mathrm{sep}} = \frac{F_i}{\,1 - \Phi\,}
\]

## Worked example

**Problem:** An M12 x 1.75 bolt (Class 10.9, \( S_p = 830 \) MPa, \( A_t = 84.3 \) mm^2) clamps a steel joint. External tensile service load \( F_e = 15 \) kN. Grip length 40 mm.

1. Proof load: \( F_p = 830 \times 84.3 = 69\,969 \) N = 70.0 kN.
2. Target preload at 75 % proof: \( F_i = 0.75 \times 70.0 = 52.5 \) kN.
3. Tightening torque (\( K = 0.20 \)): \( T = 0.20 \times 52\,500 \times 0.012 = 126 \) N-m.
4. Stiffness ratio: assume \( \Phi = 0.25 \) for typical steel members.
5. Max bolt load: \( F_b = 52.5 + 0.25 \times 15.0 = 56.25 \) kN. Utilization: \( 56.25/70.0 = 80\% \) — acceptable.
6. Remaining clamp: \( F_{\mathrm{clamp}} = 52.5 - (1-0.25) \times 15.0 = 41.25 \) kN — no separation.
7. Separation load: \( F_{\mathrm{sep}} = 52.5/0.75 = 70.0 \) kN — margin of \( 70.0/15.0 = 4.7 \).

## Common mistakes and checks

- **Insufficient preload** — Under-torqued bolts carry more of the external load as alternating stress, dramatically reducing fatigue life. Target at least 65 % of proof load.
- **Ignoring stiffness ratio** — Assuming the bolt carries the entire external load (no load sharing) is extremely conservative for tensile loads but unconservative for fatigue.
- **Confusing proof strength with yield** — Proof strength \( S_p \) is typically 85–93 % of yield. Proof load is the correct limit for tightening, not yield.
- **Neglecting embedding** — New joints lose 5–10 % of preload from surface embedding. VDI 2230 accounts for this with \( f_Z \) embedding loss factors.
- **Missing shear check in bearing joints** — If preload cannot maintain friction, bolts must be checked for single or double shear through the shank or threaded cross section.

## FAQ

### What preload should I target?
For general steel joints with torque-controlled tightening, 75 % of proof load is standard practice. For critical joints with yield-controlled tightening, 90 % is achievable. Never exceed proof load during installation.

### How accurate is torque-controlled tightening?
Torque wrench tightening has a scatter of approximately \( \pm 25\% \) on achieved preload due to friction variability. Turn-of-nut reduces scatter to \( \pm 15\% \). Hydraulic tensioning achieves \( \pm 5\% \).

### What is the VDI 2230 method?
VDI 2230 is a German standard providing a systematic 12-step worksheet for high-strength preloaded bolted joints. It accounts for embedding, thermal effects, tightening scatter, eccentric loading, and multiple load planes — more rigorous than simplified textbook methods.

### When should I use a slip-critical (friction-grip) joint?
Use friction-grip connections when the joint must resist slip under service loads (structural steel connections per AISC, vibrating equipment). The bolt is intentionally tensioned to high preload so that friction between faying surfaces carries the shear.

### How does the calculator handle combined tension and shear?
PhyCalcPro applies the AISC J3 or VDI interaction criteria. For AISC, the elliptical interaction \( (f_t/F_{nt})^2 + (f_v/F_{nv})^2 \leq 1.0 \) is checked. Both individual and combined utilizations are reported.

## Use the PhyCalcPro calculator

Analyze preload, stiffness, and utilization for bolted joints in the [Bolt Calculator](/products/fasteners/bolts).

---

**Purpose**

Analyze threaded fasteners including power screw efficiency, bolt pattern stiffness, and VDI 2230 single-bolt preloaded joint worksheet. Computes tensile, shear, bearing utilization and preload margin for mechanical joints.

**Physics & theory**

Bolted joints clamp parts together with initial preload \( F_i \) from torque \( T = K F_i d \), where \( K \) is nut factor. External tensile load \( F_e \) shares between bolt and members by stiffness: bolt load increment \( \Delta F_b = F_e k_b/(k_b + k_m) \). Separation occurs when preload is lost.

Shear may be carried by friction (when clamped) or bolt shank/threads in bearing. Combined tension and shear uses interaction criteria per AISC J3 or VDI 2230. Power screws convert torque to axial force with efficiency \( \eta = \tan\lambda / \tan(\lambda + \phi) \) for square/Acme threads.

**Governing equations**

\[
F_b = F_i + \frac{k_b}{k_b + k_m}\,F_e
\]

\[
\tau_{\mathrm{thread}} = \frac{F_{\mathrm{shear}}}{A_s}, \quad \sigma_t = \frac{F_b}{A_t}
\]

\[
T = K\,F_i\,d, \quad \eta_{\mathrm{screw}} = \frac{\tan\lambda}{\tan(\lambda + \phi)}
\]

**Numerical method**

Dual paths: (1) Power screw and pattern analysis via FEA stiffness (`femSolver`); (2) VDI 2230 worksheet for high-fidelity single-bolt joints with embedding, thermal, and tightening scatter. Validators enforce thread and geometry consistency.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| Bolt size, grade, thread pitch | Geometry and material |
| Preload / torque | Installation |
| External tensile, shear | Service loads |
| Member stiffness or grip length | Joint configuration |
| Analysis mode | Power screw, pattern, or VDI 2230 |

**Outputs**

- Bolt and member load sharing, tensile/shear/bearing utilization, preload safety margin, torque recommendation
- VDI 2230 assembly preload range

**Design codes & checks**

- **Indicative:** Tensile, shear, bearing utilization
- **US:** AISC 360-22 Chapter J3
- **EU:** EN 1993-1-8, VDI 2230 Part 1

**Assumptions & limitations**

- Linear elastic joint behavior; no gasket creep long-term model unless VDI embedding used.
- VDI 2230 is single-bolt centric; patterns use simplified stiffness superposition.
- Power screw FEA validated against Shigley benchmarks.
- Does not replace licensed pressure vessel or nuclear QA bolt procedures.

**References**

1. VDI 2230 Part 1:2015. *Systematic calculation of highly stressed bolted joints*.
2. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, 11th ed., Ch. 8.
3. AISC. *Specification for Structural Steel Buildings* (ANSI/AISC 360-22), Chapter J3.
4. Bickford, J. H. *Introduction to the Design and Behavior of Bolted Joints*, 4th ed.
5. EN 1993-1-8:2005. *Design of joints*.
