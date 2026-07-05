### Internal Gears & Rack (`internal-gears-rack`)

**Purpose**

Screen internal spur gear pairs and rack-and-pinion drives for Lewis bending and simplified Hertzian contact stress.

**Physics & theory**

Internal gearing uses a pinion meshing inside a ring gear; rack drives convert rotation to linear motion. Tangential force at the pitch line is \( W_t = 2T/d \). Lewis bending uses a higher form factor for internal pinions than external gears. Contact stress uses Hertzian line-contact screening between pitch cylinders.

**Governing equations**

\[
W_t = \frac{2T}{d}, \quad \sigma_b = \frac{W_t}{b m Y}
\]

\[
\sigma_c = \sqrt{\frac{W_t E^*}{\pi b} \left(\frac{1}{R_1} + \frac{1}{R_2}\right)}
\]

**Numerical method**

Closed-form Lewis and Hertz screening via `solveInternalGearsRackEngine` with type-specific form factors.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| `gearType` | `internal` or `rack` |
| `power`, `speed` | Transmitted power and pinion rpm |
| `module`, `faceWidth`, tooth counts | Geometry |
| `material` | Yield and elastic properties |

**Outputs**

- Bending and contact safety factors, pitch diameters, pitch-line velocity.

**Design codes & checks**

- **Indicative:** Lewis + Hertz screening
- **ISO:** ISO 6336 reference context (screening)

**Assumptions & limitations**

- No microgeometry, scuffing or planetary kinematics. Rack uses representative mating radius for contact only.

**References**

1. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, Ch. 13–14.
2. ISO 6336-1:2019 — gear rating principles.
