---
seoTitle: "Motor Sizing Calculator – Frame Class, Torque, Slip & Service Factor"
seoDescription: "Screen indicative motor frame class, rated torque, synchronous and slip speed, efficiency, and belt-drive service factor from shaft power and pole count."
guideHeadline: "Engineering guide to electric motor sizing and selection"
keywords:
  - motor sizing calculator
  - motor frame selection
  - motor torque calculation
  - synchronous speed
  - motor slip speed
  - NEMA motor frame
  - IEC motor sizing
---

### Motor Sizing (`motor`)

## How engineers select electric motors

Motor selection is the starting point for every rotating power train. The engineer determines required shaft power, operating speed, and duty cycle, then selects a motor that provides adequate torque with appropriate frame size, efficiency, and thermal rating. Induction motors dominate industrial drives, so the module focuses on NEMA and IEC squirrel-cage induction motor screening — mapping power and pole count to frame class, rated torque, slip speed, and downstream belt-drive service factors.

## Motor types and configurations

| Type | Speed control | Application |
|------|--------------|-------------|
| Squirrel-cage induction | Fixed speed or VFD | Pumps, fans, conveyors |
| Wound-rotor induction | Slip resistance | Cranes, hoists |
| Permanent magnet synchronous | VFD required | Servo, CNC, robotics |
| DC motor | Armature voltage | Legacy drives, traction |
| Synchronous reluctance | VFD | Energy-efficient pumps |

## Engineering workflow

1. Determine required mechanical shaft power from the driven load.
2. Select operating speed range — this sets the pole count (2, 4, 6, or 8).
3. Choose line frequency (50 Hz or 60 Hz).
4. Calculate synchronous speed: \( n_s = 120 f / p \).
5. Estimate rated (full-load) speed accounting for slip (typically 2–5%).
6. Compute rated shaft torque from power and speed.
7. Look up indicative frame class from NEMA/IEC power-speed tables.
8. Apply service class derating for intermittent or short-time duty.
9. Verify starting torque capability for the load's starting characteristic.
10. Pass motor power, speed, and service factor to the V-Belt or coupling module.

## Key quantities and formulas

Synchronous speed:

\[
n_s = \frac{120 \, f}{p}
\]

Slip and rated speed:

\[
s = \frac{n_s - n_r}{n_s}, \quad n_r = n_s(1 - s)
\]

Shaft torque from power:

\[
T = \frac{P}{\omega} = \frac{P \times 60}{2\pi \, n_r} = \frac{9549 \, P}{n_r} \quad \text{(N-m, kW, rpm)}
\]

Electrical input power:

\[
P_{\text{elec}} = \frac{P_{\text{shaft}}}{\eta}
\]

## Worked example

A conveyor requires 7.5 kW at approximately 1450 rpm on 50 Hz supply.

- Pole count: 4 poles gives \( n_s = 120 \times 50/4 = 1500 \) rpm.
- Rated speed: \( n_r = 1500 \times (1 - 0.033) = 1450 \) rpm (3.3% slip).
- Rated torque: \( T = 9549 \times 7.5/1450 = 49.4 \) N-m.
- Starting torque factor 2.0: \( T_{\text{start}} = 2.0 \times 49.4 = 98.8 \) N-m.
- Indicative frame: IEC 132M (7.5 kW, 4-pole) or NEMA 213T equivalent.
- Efficiency class IE3 at ~89%.
- Downstream service factor for V-belt selection: 1.2 (normal duty, continuous).

## Common mistakes and checks

- **Selecting by power alone without checking speed:** a 7.5 kW 2-pole motor has half the torque of a 4-pole motor at the same power.
- **Ignoring starting torque requirements:** centrifugal loads start easily; positive-displacement pumps and conveyors need high starting torque.
- **Confusing motor power with electrical input:** shaft power is less than electrical input by the motor's efficiency.
- **Neglecting duty cycle derating:** intermittent duty (S3–S8) allows smaller frames than continuous duty (S1) for the same peak power.
- **Oversizing motors:** running below 50% load reduces efficiency and power factor significantly.

## FAQ

### What is the difference between NEMA and IEC frame standards?

NEMA defines frame sizes by letter-number codes (e.g., 213T) used primarily in North America. IEC uses metric frame sizes (e.g., 132M) used internationally. Both map power and pole count to physical dimensions.

### How does pole count affect motor characteristics?

Fewer poles mean higher synchronous speed but lower torque per kW. A 2-pole motor runs at 3000 rpm (50 Hz) or 3600 rpm (60 Hz); a 4-pole motor at half those speeds with double the torque.

### What slip is typical for standard induction motors?

Full-load slip ranges from 2% (large, efficient motors) to 5% (small, fractional-HP motors). Slip decreases with motor size and efficiency class.

### When should I use a VFD instead of a fixed-speed motor?

When the application requires variable speed (fans, pumps with varying demand), soft starting, or precise speed control. VFDs also improve energy efficiency at partial loads.

### How does altitude affect motor rating?

Standard ratings assume installation at or below 1000 m. Above that, thinner air reduces cooling — derate motor output by approximately 1% per 100 m above 1000 m.

### What service factor should I specify?

NEMA motors typically have SF = 1.15, meaning they can deliver 115% of nameplate power continuously. IEC motors use SF = 1.0 with separate service class derating.

## Use the PhyCalcPro calculator

Open the [Motor Sizing calculator](/products/dynamics/motor) to enter required shaft power, pole count, line frequency, service class, and efficiency estimates. The tool returns synchronous and rated speed, slip, rated and starting torque, indicative frame class, and belt-drive service factor.

---

**Purpose**

Screen indicative motor frame class, rated torque, slip speed, and belt-drive service factor from required shaft power and pole count. Entry point for the connected power-train workflow (Motor, V-Belt, Shaft, Bearing).

**Physics & theory**

Induction motor synchronous speed: \( n_s = 120f/p \) (rpm) with line frequency \( f \) (Hz) and pole count \( p \). Rated speed includes slip (typically 2–5%). Shaft torque \( T = P/\omega \). Frame classes follow indicative NEMA/IEC power-speed bands (screening only). Efficiency and power factor determine electrical input for wiring and breaker sizing.

**Governing equations**

\[
n_s = \frac{120f}{p}, \quad s = \frac{n_s - n_r}{n_s}
\]

\[
T = \frac{9549 \, P}{n_r}, \quad P_{\text{elec}} = \frac{P_{\text{shaft}}}{\eta}
\]

**Numerical method**

Closed-form speed, torque, and frame class lookup from NEMA/IEC indicative tables.

**Inputs**

| Parameter | Description |
|-----------|-------------|
| `power` | Required mechanical shaft power |
| `poles` | Motor pole count (2, 4, 6, 8) |
| `lineFrequencyHz` | 50 or 60 Hz supply |
| `serviceClass` | Continuous, intermittent, or short-time duty |
| `startingTorqueFactor` | Starting torque / rated torque |
| `efficiency`, `powerFactor` | Electrical load estimates |

**Outputs**

- Synchronous and rated speed, slip, rated/starting torque, indicative frame class, suggested belt service factor, electrical input power.

**Design codes & checks**

- **Indicative:** Frame class screening, torque and speed
- **NEMA:** NEMA MG 1 motor standards (reference)
- **IEC:** IEC 60034 rotating machines (reference)

**Cross-module handoff**

On Calculate, publishes `power` (kW), `speed` (rpm), and `serviceFactor` to the V-Belt Drive module.

**Assumptions & limitations**

- Screening-level frame class — not a substitute for manufacturer catalog selection.
- Thermal duty for intermittent service simplified.
- No VFD derating or harmonic analysis.
- Starting characteristics assume standard cage; high-inertia loads may need special motors.

**Verification**

- CI: `motor-indicative-01.json`

**References**

1. NEMA MG 1-2016. *Motors and Generators*.
2. IEC 60034-1:2017. *Rotating electrical machines — Rating and performance*.
3. IEC 60034-12. *Starting performance of single-speed induction motors*.
4. Shigley, J. E., & Budynas, R. G. *Mechanical Engineering Design*, 11th ed.
5. Fitzgerald, A. E., et al. *Electric Machinery*, 7th ed. McGraw-Hill.
