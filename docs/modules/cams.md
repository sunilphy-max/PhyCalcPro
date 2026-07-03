### Cam Design (`cams`)

**Purpose**

Analyze cam–follower kinematics and kinetics: displacement, velocity, acceleration, pressure angle, and contact stress for a specified cam profile and follower type. Used for motion control mechanism screening in machine design.

**Physics & theory**

A cam imparts prescribed motion to a follower through shaped surface contact. The displacement curve \( s(\theta) \) defines follower position vs cam angle. Velocity and acceleration follow \( v = ds/dt = \omega\, ds/d\theta \) and \( a = \omega^2 d^2s/d\theta^2 \). Smooth acceleration profiles (cycloidal, modified trapezoidal) reduce impact and wear compared to sharp velocity corners.

Pressure angle \( \phi \) is the angle between follower motion direction and the normal to the cam profile. High pressure angles increase side thrust on the follower and risk binding. Contact stress between cam and follower uses Hertzian line or point contact depending on follower geometry (flat-faced, roller, or mushroom).

**Governing equations**

\[
v = \omega \frac{ds}{d\theta}, \quad a = \omega^2 \frac{d^2 s}{d\theta^2}
\]

\[
\phi = \arctan\left(\frac{ds/d\theta}{r + s + s_{\mathrm{offset}}}\right)
\]

\[
\sigma_c = \sqrt{\frac{F E^*}{\pi b \rho_{\mathrm{eq}}}}
\]

**Numerical method**

Kinematic differentiation of user-defined or standard motion laws (constant velocity, SHM, cycloidal). Pressure angle computed at each cam angle step. Contact force from follower mass, spring force, and inertia \( F = m a + k s + F_{\mathrm{ext}} \). Hertzian contact stress screened against material allowable.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| Cam base radius, motion law | Profile geometry |
| Follower type | Flat, roller, or oscillating arm |
| `speed` | Cam angular velocity |
| Follower mass, spring rate | Dynamic force |
| Lift, dwell angles | Motion program |

**Outputs**

- Displacement, velocity, acceleration plots
- max pressure angle
- contact force
- contact stress
- torque required.

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
5. PhyCalcPro verification benchmarks in `src/data/verification/` where available for this module.
6. Beer, F. P., et al. *Mechanics of Materials*, 8th ed. McGraw-Hill — foundational stress and deformation theory.
