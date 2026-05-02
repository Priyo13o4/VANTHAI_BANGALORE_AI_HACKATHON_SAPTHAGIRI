import os

files_to_fix = [
    'src/apps/cloudcare/auth/DoctorLogin.tsx',
    'src/apps/cloudcare/auth/PatientLogin.tsx',
    'src/apps/cloudcare/auth/HospitalLogin.tsx'
]

for filepath in files_to_fix:
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace `InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon color="action" /></InputAdornment> }}`
        # with `slotProps={{ input: { startAdornment: <InputAdornment position="start"><EmailIcon color="action" /></InputAdornment> } }}`
        content = content.replace("InputProps={{ startAdornment:", "slotProps={{ input: { startAdornment:")
        # We need to find the ending bracket of InputProps. Since it's on the same line, let's just use replace logic.
        # It usually ends with `} }}`? No, it's `InputProps={{ ... }}`.
        content = content.replace("</InputAdornment> }} sx={{", "</InputAdornment> } }} sx={{")
        content = content.replace("</InputAdornment> ) }} sx={{", "</InputAdornment> ) } }} sx={{")

        # PatientLogin is formatted over multiple lines.
        content = content.replace("InputProps={{", "slotProps={{ input: {")
        
        # PatientLogin multi-line ending:
        content = content.replace(
            "                  </InputAdornment>\n                }}\n",
            "                  </InputAdornment>\n                } }}\n"
        )
        content = content.replace(
            "                  )\n                }}\n",
            "                  )\n                } }}\n"
        )

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
