from pathlib import Path

root = Path('src')
bad = []
for p in root.rglob('*.tsx'):
    text = p.read_text(encoding='utf-8')
    if 'return (\n    <div className="space-y-6">' in text and '</div>\n    );\n  }' not in text:
        bad.append(str(p))

print(len(bad))
for f in bad:
    print(f)
