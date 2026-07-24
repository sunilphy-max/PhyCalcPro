---
seoTitle: "Frame Analysis Calculator — 2D Rigid Frame Forces, Moments & Deflections | PhyCalcPro"
seoDescription: "Analyze 2D rigid-jointed frames with the direct stiffness method. Compute member forces, joint reactions, stress utilizations, and deformed shapes for industrial and machine frame design."
guideHeadline: "Frame Analysis: Rigid-Jointed Structural Frames Engineering Guide"
keywords: ["frame analysis", "rigid frame", "direct stiffness method", "portal frame", "member end forces", "structural frame calculator", "2D frame analysis", "frame deflection", "joint reactions"]
---

### Frame Analysis Guide (`frames`)

## How engineers analyze frames

Rigid-jointed frames are assemblies of beams and columns connected at nodes that resist both force and moment. Unlike trusses (pin-jointed, axial only), frame members carry axial force, shear, and bending simultaneously. Portal frames, industrial mezzanines, machine tool structures, and equipment skids all behave as rigid frames under lateral and gravity loads.

The direct stiffness method is the standard numerical technique: each member contributes a 6-DOF local stiffness matrix (three at each end — horizontal displacement, vertical displacement, rotation) that is transformed to global coordinates and assembled into the structure stiffness matrix. Solving the global system \( \mathbf{K}\mathbf{u} = \mathbf{F} \) yields nodal displacements, from which member forces and reactions are back-calculated.

Engineers use frame analysis to verify that no member is overstressed, that lateral drift is within serviceability limits, and that reactions are compatible with foundation design. The PhyCalcPro frames module handles arbitrary 2D planar frames with fixed, pinned, or roller supports at any node.

## Frame configurations and applications

| Frame Type | Description | Typical Use |
|---|---|---|
| Portal Frame | Single bay, rigid beam-column joints | Industrial buildings, warehouse structures |
| Multi-bay Frame | Multiple bays sharing interior columns | Office buildings, multi-span mezzanines |
| Cantilever Frame | Columns fixed at base, free at top | Signage structures, equipment supports |
| Braced Frame | Diagonal bracing reduces lateral sway | Seismic zones, wind-sensitive structures |
| Machine Frame | Custom topology for equipment | CNC beds, press frames, conveyor supports |

## Engineering workflow

1. Define node coordinates in the 2D plane.
2. Connect members between nodes; specify E, A, I, and section depth for each member.
3. Assign support conditions: fixed, pinned, or roller at boundary nodes.
4. Apply loads: nodal point forces/moments, member distributed loads.
5. Run the direct stiffness solver.
6. Review member force diagrams: axial, shear, and moment for each member.
7. Check stress utilizations: combined axial + bending stress vs allowable.
8. Verify joint equilibrium: confirm reaction residuals are negligible.
9. Assess sway deflection against drift limits (H/300 typical for industrial frames).

## Key quantities and formulas

\[
\mathbf{K} \mathbf{u} = \mathbf{F}
\]

Member combined stress:

\[
\sigma = \frac{N}{A} \pm \frac{M c}{I}
\]

Utilization ratio:

\[
U = \frac{\sigma_{\mathrm{combined}}}{\sigma_{\mathrm{allow}}} \leq 1.0
\]

Member stiffness coefficients (prismatic member of length L):

\[
k_{11} = \frac{EA}{L}, \quad k_{22} = \frac{12EI}{L^3}, \quad k_{23} = \frac{6EI}{L^2}, \quad k_{33} = \frac{4EI}{L}
\]

## Worked example

**Problem:** A single-bay portal frame has columns of height 4 m and a beam spanning 6 m. All members are IPE 240 steel (\( E = 210 \) GPa, \( A = 39.1 \) cm\(^2\), \( I = 3892 \) cm\(^4\), \( c = 0.12 \) m). Columns are fixed at the base. A horizontal wind load of 20 kN acts at the beam level. Find the maximum member stress.

**Step 1 — Model:**
- 4 nodes: two base supports (fixed), two beam-column joints.
- 3 members: two columns (4 m vertical), one beam (6 m horizontal).
- Horizontal load of 20 kN at the beam-column joint on the windward side.

**Step 2 — Solver output (from direct stiffness):**
- Column base moments: windward = 52.4 kN-m, leeward = 27.6 kN-m.
- Beam end moments: 27.6 kN-m at each joint (antisymmetric distribution).
- Maximum column axial force: 9.2 kN (from frame action).

**Step 3 — Combined stress in windward column:**

\[
\sigma = \frac{N}{A} + \frac{M c}{I} = \frac{9.2 \times 10^3}{39.1 \times 10^{-4}} + \frac{52.4 \times 10^3 \times 0.12}{3892 \times 10^{-8}} = 2.4 + 161.6 = 164.0 \text{ MPa}
\]

Utilization against S275: \( 164/275 = 0.60 \) — adequate.

## Common mistakes and checks

- **Forgetting moment transfer at rigid joints:** All members meeting at a rigid joint share the same rotation; assigning pin connections when joints are welded gives unconservative member moments.
- **Applying loads only at nodes:** Distributed member loads must be converted to fixed-end forces; the solver handles this, but applying forces only at nodes misses local bending in the member.
- **Ignoring P-delta effects:** For tall or heavily loaded frames, geometric nonlinearity (P-delta) can amplify moments by 10-30%; the current linear solver does not capture this.
- **Wrong support assumptions:** Industrial frames often have nominally pinned column bases that provide partial fixity; both fixed and pinned assumptions should be checked as bounds.
- **Neglecting out-of-plane behavior:** The 2D solver assumes all loads and deformations are in-plane; out-of-plane stability must be verified separately.

## FAQ

### Can I model a pin connection at a member end?

Yes — flag the member end as pinned (moment release). This sets the rotational DOF at that end to zero moment, simulating a hinge. By default all joints are rigid.

### How do I handle a frame with inclined members?

The solver uses node coordinates to determine member orientation automatically. Define nodes at the actual positions and connect members — the coordinate transformation handles any angle.

### What if my frame is statically indeterminate?

The stiffness method handles any degree of indeterminacy automatically. Unlike hand methods (moment distribution, slope-deflection), the solver assembles and solves the full system regardless of redundancy.

### Does the module check for frame instability (sway buckling)?

The current solver performs first-order elastic analysis. It does not compute frame buckling loads. Use the column module on individual members with appropriate effective lengths to screen for member buckling in sway frames.

### How accurate are the stress utilizations?

The utilizations are screening-level checks combining axial and bending stress linearly. They do not implement full AISC H1 interaction equations or EN 1993-1-1 Section 6.3.3 beam-column checks. Use results as preliminary sizing, then verify with detailed code checks.

## Use the PhyCalcPro calculator

[Open the Frame Analysis calculator](/products/structural/frames)

**Purpose**

Perform two-dimensional elastic frame analysis for rigid-jointed structures composed of prismatic members. Assembles global stiffness matrices, applies nodal loads and support constraints, and returns member end forces, joint reactions, and stress utilizations for machine and industrial frame screening.

**Physics & theory**

A plane frame member carries axial force, shear, and bending moment. Each member contributes a 6x6 stiffness matrix in local coordinates that is transformed to global axes before assembly. Equilibrium requires \( \mathbf{K}\mathbf{u} = \mathbf{F} \). Member stresses are recovered from combined axial and bending components for utilization screening.

**Governing equations**

\[
\mathbf{K} \mathbf{u} = \mathbf{F}, \quad \sigma = \frac{N}{A} \pm \frac{Mc}{I}, \quad U = \frac{\sigma_{\mathrm{combined}}}{\sigma_{\mathrm{allow}}}
\]

**Numerical method**

Direct stiffness method: element stiffness matrices are transformed and assembled; boundary conditions eliminate constrained DOFs. The reduced linear system is solved for nodal displacements. Member end forces are back-calculated from element deformations.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| Nodes | Coordinates and support/fixity flags |
| Members | Start/end nodes, \( E \), \( A \), \( I \), section depth |
| Loads | Nodal forces/moments, member distributed loads |
| Material | Yield or allowable stress for utilization |

**Outputs**

- Nodal displacements and rotations
- Member axial force, shear, and end moments
- Joint reactions
- Member stress utilization ratios
- Equilibrium check residuals

**Design codes & checks**

- **Indicative:** Member stress utilization, joint equilibrium
- **US/EU/ISO:** Application-dependent; presets reference industrial equipment standards

**Assumptions & limitations**

- 2D plane frame only; no out-of-plane buckling or torsion.
- Prismatic members, linear elastic behavior.
- Rigid joints unless member end releases are specified.
- No P-delta geometric nonlinearity.
- Does not replace licensed structural design per building codes.

**Verification**

- CI: verification benchmarks in `src/data/verification/` where available
- Engineer sign-off: [validation-master-checklist.md](../validation-master-checklist.md)

**References**

1. Hibbeler, R. C. *Structural Analysis*, 10th ed. Pearson.
2. McCormac, J. C., & Brown, R. H. *Structural Analysis*, 5th ed. Cengage.
3. McGuire, W., Gallagher, R. H., & Ziemian, R. D. *Matrix Structural Analysis*, 2nd ed. Wiley.
4. EN 1993-1-1:2005. *Eurocode 3 — General rules*.
5. ISO 12100:2010. *Safety of machinery — General principles for design*.
