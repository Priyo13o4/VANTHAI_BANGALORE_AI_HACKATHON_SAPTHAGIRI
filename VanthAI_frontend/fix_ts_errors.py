import re
import os

# 1. Fix useHospital.ts imports
use_hospital_path = 'src/apps/cloudcare/hooks/useHospital.ts'
with open(use_hospital_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Change imports from @/types/hospital to @/lib/api/hospital for those specific types
content = content.replace(
    "} from '@/types/hospital';",
    "} from '@/types/hospital';\nimport type { AddStaffRequest, Staff, UpdateResourceRequest, HospitalLoginRequest } from '@/lib/api/hospital';"
)
content = content.replace('  Staff,\n', '')
content = content.replace('  HospitalLoginRequest,\n', '')
content = content.replace('  AddStaffRequest,\n', '')
content = content.replace('  UpdateResourceRequest,\n', '')

with open(use_hospital_path, 'w', encoding='utf-8') as f:
    f.write(content)

# 2. Fix PieLabelRenderProps in HospitalDashboard.tsx
dashboard_path = 'src/apps/cloudcare/hospital/HospitalDashboard.tsx'
with open(dashboard_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, department, percentage }: any) => {', 'const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, payload }: any) => {')
content = content.replace('{department} ({percentage}%)', '{payload.department} ({payload.percentage}%)')

with open(dashboard_path, 'w', encoding='utf-8') as f:
    f.write(content)

# 3. Fix PieLabelRenderProps in HospitalResources.tsx
resources_path = 'src/apps/cloudcare/hospital/HospitalResources.tsx'
with open(resources_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, category, percentage }: any) => {', 'const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, payload }: any) => {')
content = content.replace('{category} ({percentage}%)', '{payload.category} ({payload.percentage}%)')

with open(resources_path, 'w', encoding='utf-8') as f:
    f.write(content)

# 4. Fix PatientAppointments.tsx
appointments_path = 'src/apps/cloudcare/patient/PatientAppointments.tsx'
with open(appointments_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("import type { AppointmentWithDetails } from '../../../types/api';", "import type { AppointmentWithDetails } from '../data/mockData';")
# Fix Date not assignable to string
content = content.replace('date.toISOString()', 'date.toISOString().split("T")[0]')

with open(appointments_path, 'w', encoding='utf-8') as f:
    f.write(content)

# 5. Fix PatientPrescriptions.tsx
prescriptions_path = 'src/apps/cloudcare/patient/PatientPrescriptions.tsx'
with open(prescriptions_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("import type { Prescription } from '../../../types/api';", "import type { Prescription } from '../data/mockData';")
# Fix Date not assignable to string
content = content.replace('date.toISOString()', 'date.toISOString().split("T")[0]')
# Fix multiple attributes with the same name
# Looking for duplicate attributes
# I'll just use regex to remove duplicate 'fullWidth' or whatever it is.
# The error was at line 270. Let's find it.
# Actually I'll print the line to see what it is.
lines = content.split('\n')
if len(lines) >= 270:
    print("Line 270:", lines[269])
    # manually fix duplicate fullWidth if it exists
    lines[269] = lines[269].replace('fullWidth fullWidth', 'fullWidth').replace('margin="normal" margin="normal"', 'margin="normal"')
    content = '\n'.join(lines)

with open(prescriptions_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed TS errors.")
