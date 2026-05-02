import os
import re

files_to_fix = [
    'src/apps/cloudcare/patient/PatientPrescriptions.tsx',
    'src/apps/cloudcare/patient/PatientRecords.tsx',
    'src/apps/cloudcare/patient/PatientVitals.tsx'
]

for filepath in files_to_fix:
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # We need to merge <Typography ... sx={{ fontWeight: 600 }} ... sx={{ ... }}>
        # The easiest way is to find "sx={{ fontWeight: 600 }} gutterBottom sx={{ mt: 2 }}"
        # and replace with "gutterBottom sx={{ fontWeight: 600, mt: 2 }}"
        content = content.replace(
            "sx={{ fontWeight: 600 }} gutterBottom sx={{ mt: 2 }}",
            "gutterBottom sx={{ fontWeight: 600, mt: 2 }}"
        )
        content = content.replace(
            "sx={{ fontWeight: 600 }} sx={{ mt: 0.5 }}",
            "sx={{ fontWeight: 600, mt: 0.5 }}"
        )
        content = content.replace(
            "sx={{ fontWeight: 600 }} gutterBottom sx={{ mb: 3 }}",
            "gutterBottom sx={{ fontWeight: 600, mb: 3 }}"
        )

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
