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
