from pathlib import Path
import re

root = Path('src')
pattern = re.compile(r'(if \(!result\) \{\n\s*return \(\n\s*<div className="space-y-6">\n)(.*?)(\n\s*\);\n\s*\})', re.S)

fixed_files = []
for p in root.rglob('*.tsx'):
    text = p.read_text(encoding='utf-8')
    if pattern.search(text):
        new_text = pattern.sub(r"\1\2\n    </div>\3", text)
        if new_text != text:
            p.write_text(new_text, encoding='utf-8')
            fixed_files.append(str(p))

print(f'Fixed {len(fixed_files)} files:')
for f in fixed_files:
    print(f)
