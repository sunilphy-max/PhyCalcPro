### Motor Sizing (`motor`)

**Purpose**

Screen indicative motor frame class, rated torque, slip speed, and belt-drive service factor from required shaft power and pole count. Entry point for the connected power-train workflow (Motor → V-Belt → Shaft → Bearing → …).

**Physics & theory**

Induction motor synchronous speed: \( n_s = 120 f / p \) (rpm) with line frequency \( f \) (Hz) and pole count \( p \). Rated speed includes slip (typically 2–5%). Shaft torque \( T = P / \omega \) with \( \omega = 2\pi n / 60 \).

Frame classes follow indicative NEMA/IEC power–speed bands (screening only, not vendor catalog selection).

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

- Synchronous and rated speed, slip, rated/starting torque, indicative frame class, suggested belt service factor.

**Cross-module handoff**

On Calculate, publishes `power` (kW), `speed` (rpm), and `serviceFactor` to the V-Belt Drive module.

**Verification**

- CI: `motor-indicative-01.json`
