---
seoTitle: "Cam Design Calculator – Kinematics, Pressure Angle & Contact Stress"
seoDescription: "Analyze cam-follower mechanisms: displacement, velocity, acceleration profiles, pressure angle screening, and Hertzian contact stress for machine design."
guideHeadline: "Engineering guide to cam mechanism design and motion analysis"
keywords:
  - cam design calculator
  - cam follower kinematics
  - pressure angle analysis
  - cam contact stress
  - cycloidal cam profile
  - cam displacement curve
  - machine cam mechanism
---

### Cam Design (`cams`)

## How engineers design cam mechanisms

Cams convert uniform shaft rotation into prescribed follower motion — lift, dwell, return — for valve trains, packaging machines, and automated assembly. The design process starts with the required motion program, selects a mathematical profile (SHM, cycloidal, modified trapezoidal), and then verifies that pressure angle stays within limits and contact stress remains below material allowables.

## Types and configurations

| Cam type | Follower | Application |
|----------|----------|-------------|
| Disk (radial) cam | Translating roller | Engine valves, packaging |
| Disk cam | Flat-faced follower | High-speed, low wear |
| Cylindrical cam | Oscillating arm | Textile machinery |
| Conjugate cam | Positive return | No return spring needed |
| Globoidal cam | Turret indexer | Intermittent motion |

## Engineering workflow

1. Define the motion program: rise height, dwell angles, return angles.
2. Select a motion law for each segment (cycloidal, modified trapezoidal, etc.).
3. Choose base circle radius to keep maximum pressure angle below 30 deg (translating) or 45 deg (oscillating).
4. Compute displacement, velocity, and acceleration at each cam angle step.
5. Calculate follower contact force from mass, spring preload, and inertia.
6. Screen Hertzian contact stress between cam surface and follower.
7. Check cam profile for undercutting (negative radius of curvature).
8. Verify spring force exceeds inertia load at all points to maintain contact.

## Key quantities and formulas

Follower velocity and acceleration:

\[
v = \omega \frac{ds}{d\theta}, \quad a = \omega^2 \frac{d^2 s}{d\theta^2}
\]

Pressure angle:

\[
\phi = \arctan\!\left(\frac{ds/d\theta}{r_b + s}\right)
\]

Hertzian contact stress (roller follower):

\[
\sigma_c = \sqrt{\frac{F \, E^*}{\pi \, b \, \rho_{\text{eq}}}}
\]

## Worked example

A cycloidal cam lifts a roller follower 20 mm over 120 deg at 600 rpm. Base circle radius 40 mm, follower mass 0.5 kg, spring rate 10 N/mm with 50 N preload.

- Angular velocity: \( \omega = 2\pi \times 600/60 = 62.8 \) rad/s.
- Peak acceleration (cycloidal): \( a_{\max} = 2\pi h \omega^2 / \beta^2 = 2\pi \times 0.020 \times 62.8^2 / (2\pi/3)^2 = 1133 \) m/s\(^2\).
- Peak inertia force: \( F_i = 0.5 \times 1133 = 567 \) N.
- Maximum pressure angle checked against 30 deg limit.

## Common mistakes and checks

- **Choosing SHM for high-speed cams:** simple harmonic motion has discontinuous acceleration at transition points, causing impact and vibration.
- **Base circle too small:** increases pressure angle, causing follower binding and guide wear.
- **Insufficient spring preload:** the follower separates from the cam at high acceleration, causing "bounce" and impact damage.
- **Ignoring manufacturing tolerances:** cam profile errors amplify at higher derivatives — velocity and acceleration sensitivity to machining quality.

## FAQ

### Why is cycloidal motion preferred for high-speed cams?

Cycloidal profiles have continuous acceleration (finite jerk), eliminating the shock loading that occurs at velocity discontinuities in simpler profiles.

### What is an acceptable maximum pressure angle?

For translating followers: 30 deg. For oscillating followers: 45 deg. Beyond these limits, side thrust causes guide wear and potential binding.

### How does roller size affect cam design?

Larger rollers reduce contact stress but increase the minimum cam radius. The roller must be smaller than the minimum radius of curvature of the pitch curve.

### Can this module handle multi-dwell cam profiles?

Yes — define rise, dwell, return, and additional dwell segments with individual motion laws for each.

### What causes cam undercutting?

When the pitch curve radius of curvature becomes smaller than the roller radius, the cam surface folds over itself and cannot be manufactured.

## Use the PhyCalcPro calculator

Open the [Cam Design calculator](/products/machine/cams) to enter base radius, motion law, lift, dwell angles, speed, and follower parameters. The tool returns displacement/velocity/acceleration plots, maximum pressure angle, contact force, and contact stress.

---

**Purpose**

Analyze cam-follower kinematics and kinetics: displacement, velocity, acceleration, pressure angle, and contact stress for a specified cam profile and follower type.

**Physics & theory**

A cam imparts prescribed motion to a follower through shaped surface contact. The displacement curve \( s(\theta) \) defines follower position vs cam angle. Velocity and acceleration follow from derivatives with respect to time. Pressure angle measures the deviation between follower motion direction and the cam normal — high values increase side thrust and binding risk. Contact stress uses Hertzian theory.

**Governing equations**

\[
v = \omega \frac{ds}{d\theta}, \quad a = \omega^2 \frac{d^2 s}{d\theta^2}
\]

\[
\phi = \arctan\!\left(\frac{ds/d\theta}{r_b + s}\right)
\]

\[
\sigma_c = \sqrt{\frac{F \, E^*}{\pi \, b \, \rho_{\text{eq}}}}
\]

**Numerical method**

Kinematic differentiation of standard motion laws (constant velocity, SHM, cycloidal). Pressure angle computed at each cam angle step. Contact force from follower mass, spring force, and inertia. Hertzian contact stress screened against allowable.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| Cam base radius, motion law | Profile geometry |
| Follower type | Flat, roller, or oscillating arm |
| `speed` | Cam angular velocity |
| Follower mass, spring rate | Dynamic force |
| Lift, dwell angles | Motion program |

**Outputs**

- Displacement, velocity, acceleration plots, max pressure angle, contact force, contact stress, torque required.

**Design codes & checks**

- **Indicative:** Pressure angle limit, cam contact stress screening

**Assumptions & limitations**

- 2D planar cam; no 3D spatial cams or conjugate surface optimization.
- Rigid cam and follower; no compliance or lubrication film analysis.
- Single-dwell motion programs; multi-segment profiles user-defined.
- Manufacturing eccentricity and wear not modeled.

**References**

1. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, 11th ed., Ch. 16.
2. Norton, R. L. *Design of Machinery*, 6th ed. McGraw-Hill.
3. Chen, F. Y. *Mechanics and Design of Cam Mechanisms*. Pergamon.
4. Hertz, H. *On the Contact of Elastic Solids* (contact stress foundation).
