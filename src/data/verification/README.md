# Verification cases (Phase 0)

Add benchmark JSON files here as you verify each module against US, EU, or ISO references.

## File naming

`{moduleId}-{designCode}-{slug}.json`

Example: `beams-US-cantilever-tip.json`

## Schema

```json
{
  "id": "beams-US-cantilever-tip",
  "moduleId": "beams",
  "designCode": "US",
  "description": "Cantilever with end load — compare to manual calc",
  "inputs": {},
  "expected": {
    "maxDeflection": 0.012
  },
  "tolerancePercent": 5,
  "source": "Your worksheet / code example"
}
```

The CI runner will be wired in a follow-up step to execute these cases automatically.
