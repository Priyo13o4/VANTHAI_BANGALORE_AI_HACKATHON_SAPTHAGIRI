# Page: Patient Vitals (Wearables & Sensors)
**Route:** `/cloudcare/patient/vitals`
**Agent Purpose:** Real-time dashboard of wearable sensor data — heart rate, SpO2, blood pressure, temperature, steps.

## Page Structure

### Page Heading
- Title: "Vitals & Wearables"
- Subtitle: "Live sensor readings from your wearable device"

### Vitals Summary Cards (top row)
Each card shows current reading + trend arrow + last-updated timestamp:
| Vital | Unit | Normal Range |
|---|---|---|
| Heart Rate | bpm | 60–100 |
| SpO2 | % | 95–100 |
| Blood Pressure | mmHg | 90–120 / 60–80 |
| Temperature | °C | 36.1–37.2 |
| Steps Today | steps | — |

### Heart Rate Chart
- Line chart — last 24 hours of heart rate readings
- X-axis: time (hourly), Y-axis: bpm

### Alert Banners
If any reading falls outside normal range:
- Red banner with "⚠️ {vital} out of normal range: current {value}, normal {range}"
- Badge visible on sidebar nav if alerts are active

### Key `data-vanthai-id` Attributes
| Element | ID |
|---|---|
| Vitals page root | `cloudcare-vitals-root` |
| Heart rate card | `cloudcare-vitals-heart-rate` |
| SpO2 card | `cloudcare-vitals-spo2` |
| Blood pressure card | `cloudcare-vitals-bp` |
| Temperature card | `cloudcare-vitals-temp` |
| Steps card | `cloudcare-vitals-steps` |
| Alert badge/banner | `cloudcare-vitals-alert-badge` |
| HR trend chart | `cloudcare-vitals-hr-chart` |

## Agent Guidance
- When user asks "how are my vitals", "heart rate", "blood pressure", "wearables", navigate here
- Use `highlight` + `cloudcare-vitals-alert-badge` to draw attention to active alerts
- The agent can explain what each metric means and whether it is in normal range
- Readings are live (fetched every 30s); agent should note data freshness when explaining
