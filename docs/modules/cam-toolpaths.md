### CAM Toolpaths (`cam-toolpaths`) — **draft**

**Purpose**

Estimate basic milling parameters — feed rate, surface speed, step-over, number of passes, material removal rate, and cut time — for rectangular pocket or slot roughing strategies. Supports machining parameter screening before full CAM programming.

**Physics & theory**

Milling feed rate \( F = f_z \cdot Z \cdot n \) combines feed per tooth \( f_z \), number of flutes \( Z \), and spindle speed \( n \) (rpm). Surface (cutting) speed \( v_c = \pi D n / 1000 \) (m/min) with tool diameter \( D \) mm relates to tool life and heat generation.

Step-over (radial engagement) as fraction of tool diameter determines scallop height and number of lateral passes across stock width. Material removal rate MRR = \( F \cdot a_p \cdot a_e \) for axial depth \( a_p \) and radial depth \( a_e \). Cut time = path length / feed rate per pass × number of passes.

Manufacturing modules support design-for-manufacture decisions early in product development. Tolerance analysis should identify critical dimensions in the stack — tightening non-critical tolerances increases cost without improving function.

Fit selection balances assembly ease, alignment precision, and load transmission. Interference fits provide torque capacity without keys but require controlled press force and material compatibility.

**Governing equations**

\[
F = f_z \cdot Z \cdot n
\]

\[
v_c = \frac{\pi D n}{1000}
\]

\[
\mathrm{MRR} = F \cdot a_p \cdot w_{\mathrm{step}}, \quad t_{\mathrm{cut}} = \frac{L_{\mathrm{pass}}}{F/60} \cdot N_{\mathrm{passes}}
\]

**Numerical method**

Closed-form machining equations (`camToolpaths/engine`). Passes = ceil(stock width / step-over width). Feed rate from user tooth feed and spindle speed; no chip load optimization or tool deflection.

**Solver pipeline:** Inputs are validated for positive geometry and material values. The core engine in `src/lib/` executes the numerical model, then post-processes peak values, utilizations, and physics checks. Results are returned in SI base units for consistent handoff to charts (`EngineeringPlot`) and export.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| `toolDiameter`, `numFlutes` | Tool geometry |
| `spindleSpeed`, `feedPerTooth` | Speeds and feeds |
| `axialDepth`, `radialDepth` | Depth of cut |
| `stockLength`, `stockWidth` | Stock envelope |
| `stepOverPercent` | Radial engagement fraction |

**Outputs**

- Feed rate, surface speed, step-over width, pass count
- MRR, time per pass, total cut time.

**Design codes & checks**

- **Indicative:** Toolpath length and cut time (draft module)

**Related modules**

See adjacent entries in the same product category (`src/data/modules.ts`) for complementary checks — e.g., combine structural results with `load-case-manager`, material data from `material-db`, or hand off section properties from `rolled-sections` and `sections`.

**Example workflow**

1. Select design code (Indicative, US, EU, or ISO) and confirm unit profile defaults.
2. Enter geometry, material properties, and operating loads from the module input panel.
3. Review peak utilizations, code checks, and solver warnings in `CalculatorResultsShell`.
4. Export results or hand off key outputs (forces, stresses, dimensions) to related modules via design workflows where supported.

**Implementation notes**

Solver source: `src/lib/` — see module engine and types for exact input field names. Design code checks are orchestrated through `moduleStandardCatalog` with validation status per module. Export and saved projects preserve inputs for reproducibility.

**Assumptions & limitations**

- **Draft status:** simplified 2.5D pocket strategy only.
- No collision checking, tool engagement angle, or adaptive clearing.
- Constant spindle speed; no ramp entry or helical interpolation.
- Tool wear, runout, and machine dynamics not modeled.

**References**

1. Stephenson, D. A., & Agapiou, J. S. *Metal Cutting Theory and Practice*, 3rd ed. CRC Press.
2. Sandvik Coromant. *Metalworking Handbook*.
3. Altintas, Y. *Manufacturing Automation*. Cambridge University Press.
4. ISO 3685:1993. *Tool-life testing with single-point turning tools* (methodology context).
5. PhyCalcPro verification benchmarks in `src/data/verification/` where available for this module.
6. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
