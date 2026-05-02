import os
import re
import glob

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # Fix fontWeight={number} -> sx={{ fontWeight: number }} on Typography components
    # We need to be careful. Let's find <Typography ... fontWeight={600} ...>
    # Actually, the error is specifically for `fontWeight`.
    content = re.sub(r'fontWeight=\{([0-9]+)\}', r'sx={{ fontWeight: \1 }}', content)
    
    # Fix InputProps={...} -> slotProps={{ input: ... }}
    # This might be tricky because it spans multiple lines.
    # A simpler way: replace `InputProps={{` with `slotProps={{ input: {` and then we have to close the extra brace? No, `InputProps={{ x }}` becomes `slotProps={{ input: { x } }}`.
    # Actually, let's just replace `InputProps={{` with `slotProps={{ input: {` and we need to add a closing brace.
    # Wait, `InputProps` is an object. `InputProps={ { startAdornment: ... } }`.
    # Let's write a regex that matches `InputProps={` and we replace it with `slotProps={{ input: `. But then the closing `}` matches.
    # Actually, let's look at the exact `InputProps` in the files.
    
    if original != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed fontWeight in {filepath}")

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx'):
            fix_file(os.path.join(root, file))

