"""
Apply the corrected GDP values to data.js.
Replaces all 7 remaining states + 13 UT entity entries.
"""
import re

with open('js/data.js', 'r', encoding='utf-8') as f:
    content = f.read()

# ── NEW JS CODE for all 20 remaining states ──────────────────────────
new_entries = '''    // ════════════════════════════════════════════════════════
    //  Remaining 7 States  (reconciled: residual = National − 16 major − 13 UTs)
    //  Each year: residual distributed by MOSPI 2024 GDP weight
    //  Note: residual shrinks sharply 2030-2035 because the 16 major states'
    //  two-phase CAGR temporarily concentrates ~99% of national GDP.
    //  Floor clamp at 1% of 2024 GDP prevents negative values.
    // ════════════════════════════════════════════════════════
    {
        name: "Jharkhand", code: "JH",
        popMillions: 40.9,
        gdpAnchors: { 2024: 107.9, 2025: 126.6, 2026: 143.8, 2027: 129.2, 2028: 106.0, 2029: 72.8, 2030: 22.4, 2031: 0.5, 2032: 0.5, 2033: 0.5, 2034: 0.5, 2035: 0.5, 2036: 6.7, 2037: 29.7, 2038: 58.4, 2039: 94.2, 2040: 132.0, 2041: 178.7, 2042: 233.2, 2043: 296.2, 2044: 372.6, 2045: 459.2, 2046: 562.6, 2047: 681.1 },
        focusSectors: "Mining, steel, agriculture, tourism",
        cumInvestment: null
    },
    {
        name: "Chhattisgarh", code: "CG",
        popMillions: 31.6,
        gdpAnchors: { 2024: 120.0, 2025: 140.8, 2026: 159.9, 2027: 143.7, 2028: 117.8, 2029: 81.0, 2030: 24.9, 2031: 0.6, 2032: 0.6, 2033: 0.6, 2034: 0.6, 2035: 0.6, 2036: 7.5, 2037: 33.0, 2038: 64.9, 2039: 104.8, 2040: 146.8, 2041: 198.7, 2042: 259.4, 2043: 329.4, 2044: 414.4, 2045: 510.6, 2046: 625.6, 2047: 757.4 },
        focusSectors: "Mining, steel, power, agriculture",
        cumInvestment: null
    },
    {
        name: "Assam", code: "AS",
        popMillions: 37.2,
        gdpAnchors: { 2024: 123.7, 2025: 145.2, 2026: 164.7, 2027: 148.1, 2028: 121.5, 2029: 83.4, 2030: 25.8, 2031: 0.6, 2032: 0.6, 2033: 0.6, 2034: 0.6, 2035: 0.6, 2036: 7.7, 2037: 34.0, 2038: 66.9, 2039: 108.0, 2040: 151.3, 2041: 204.7, 2042: 267.3, 2043: 339.5, 2044: 427.1, 2045: 526.3, 2046: 644.8, 2047: 780.6 },
        focusSectors: "Tea, oil & gas, tourism, agro-industries",
        cumInvestment: null
    },
    {
        name: "Uttarakhand", code: "UK",
        popMillions: 12.0,
        gdpAnchors: { 2024: 78.6, 2025: 92.2, 2026: 104.7, 2027: 94.0, 2028: 77.1, 2029: 53.0, 2030: 16.3, 2031: 0.4, 2032: 0.4, 2033: 0.4, 2034: 0.4, 2035: 0.4, 2036: 4.9, 2037: 21.6, 2038: 42.5, 2039: 68.6, 2040: 96.1, 2041: 130.1, 2042: 169.8, 2043: 215.6, 2044: 271.3, 2045: 334.3, 2046: 409.6, 2047: 495.9 },
        focusSectors: "Tourism, pharma, IT, renewable energy",
        cumInvestment: null
    },
    {
        name: "Himachal Pradesh", code: "HP",
        popMillions: 7.5,
        gdpAnchors: { 2024: 49.7, 2025: 58.2, 2026: 66.1, 2027: 59.4, 2028: 48.7, 2029: 33.5, 2030: 10.3, 2031: 0.2, 2032: 0.2, 2033: 0.2, 2034: 0.2, 2035: 0.2, 2036: 3.1, 2037: 13.6, 2038: 26.8, 2039: 43.3, 2040: 60.7, 2041: 82.2, 2042: 107.3, 2043: 136.3, 2044: 171.4, 2045: 211.2, 2046: 258.8, 2047: 313.3 },
        focusSectors: "Tourism, hydro power, horticulture",
        cumInvestment: null
    },
    {
        name: "Jammu & Kashmir", code: "JK",
        popMillions: 14.9,
        gdpAnchors: { 2024: 57.0, 2025: 66.8, 2026: 75.9, 2027: 68.2, 2028: 55.9, 2029: 38.4, 2030: 11.8, 2031: 0.3, 2032: 0.3, 2033: 0.3, 2034: 0.3, 2035: 0.3, 2036: 3.6, 2037: 15.7, 2038: 30.8, 2039: 49.7, 2040: 69.7, 2041: 94.3, 2042: 123.1, 2043: 156.4, 2044: 196.7, 2045: 242.5, 2046: 297.1, 2047: 359.6 },
        focusSectors: "Tourism, handicrafts, horticulture, IT",
        cumInvestment: null
    },
    {
        name: "Goa", code: "GA",
        popMillions: 1.6,
        gdpAnchors: { 2024: 23.1, 2025: 27.1, 2026: 30.8, 2027: 27.6, 2028: 22.7, 2029: 15.6, 2030: 4.8, 2031: 0.1, 2032: 0.1, 2033: 0.1, 2034: 0.1, 2035: 0.1, 2036: 1.4, 2037: 6.3, 2038: 12.5, 2039: 20.2, 2040: 28.2, 2041: 38.2, 2042: 49.9, 2043: 63.4, 2044: 79.7, 2045: 98.3, 2046: 120.4, 2047: 145.8 },
        focusSectors: "Tourism, IT, pharma, mining",
        cumInvestment: null
    },
    // ── NE States & smaller UTs (actual GSDP from MOSPI/Wikipedia FY2023-24) ──
    // Base: ₹ billion FY2023-24 → CY2024 $B at ₹83.5/$, ×1.05 overlap adjustment
    // Growth: entity-specific rates based on historical MOSPI trends (USD terms)
    {
        name: "Sikkim", code: "SK",
        popMillions: 0.7,
        gdpAnchors: { 2024: 5.4, 2025: 6.0, 2026: 6.7, 2027: 7.5, 2028: 8.3, 2029: 9.3, 2030: 10.4, 2031: 11.6, 2032: 12.9, 2033: 14.4, 2034: 16.0, 2035: 17.9, 2036: 19.9, 2037: 22.2, 2038: 24.8, 2039: 27.6, 2040: 30.8, 2041: 34.4, 2042: 38.3, 2043: 42.7, 2044: 47.6, 2045: 53.1, 2046: 59.2, 2047: 66.0 },
        focusSectors: "Tourism, organic farming, hydropower",
        cumInvestment: null
    },
    {
        name: "Arunachal Pradesh", code: "AR",
        popMillions: 1.7,
        gdpAnchors: { 2024: 4.4, 2025: 5.0, 2026: 5.6, 2027: 6.3, 2028: 7.0, 2029: 7.9, 2030: 8.9, 2031: 10.0, 2032: 11.3, 2033: 12.7, 2034: 14.3, 2035: 16.1, 2036: 18.1, 2037: 20.3, 2038: 22.9, 2039: 25.7, 2040: 29.0, 2041: 32.6, 2042: 36.7, 2043: 41.2, 2044: 46.4, 2045: 52.2, 2046: 58.7, 2047: 66.1 },
        focusSectors: "Hydropower, tourism, agriculture",
        cumInvestment: null
    },
    {
        name: "Meghalaya", code: "ML",
        popMillions: 3.5,
        gdpAnchors: { 2024: 5.9, 2025: 6.6, 2026: 7.4, 2027: 8.3, 2028: 9.3, 2029: 10.4, 2030: 11.6, 2031: 13.0, 2032: 14.6, 2033: 16.4, 2034: 18.3, 2035: 20.5, 2036: 23.0, 2037: 25.7, 2038: 28.8, 2039: 32.3, 2040: 36.2, 2041: 40.5, 2042: 45.4, 2043: 50.8, 2044: 56.9, 2045: 63.7, 2046: 71.4, 2047: 80.0 },
        focusSectors: "Mining, tourism, agriculture",
        cumInvestment: null
    },
    {
        name: "Manipur", code: "MN",
        popMillions: 3.2,
        gdpAnchors: { 2024: 5.1, 2025: 5.7, 2026: 6.3, 2027: 7.0, 2028: 7.7, 2029: 8.6, 2030: 9.5, 2031: 10.6, 2032: 11.8, 2033: 13.0, 2034: 14.5, 2035: 16.1, 2036: 17.8, 2037: 19.8, 2038: 22.0, 2039: 24.4, 2040: 27.1, 2041: 30.1, 2042: 33.4, 2043: 37.0, 2044: 41.1, 2045: 45.6, 2046: 50.7, 2047: 56.2 },
        focusSectors: "Handloom, agriculture, tourism",
        cumInvestment: null
    },
    {
        name: "Mizoram", code: "MZ",
        popMillions: 1.3,
        gdpAnchors: { 2024: 3.9, 2025: 4.3, 2026: 4.8, 2027: 5.4, 2028: 6.0, 2029: 6.7, 2030: 7.5, 2031: 8.4, 2032: 9.3, 2033: 10.4, 2034: 11.6, 2035: 12.9, 2036: 14.4, 2037: 16.1, 2038: 17.9, 2039: 20.0, 2040: 22.3, 2041: 24.8, 2042: 27.7, 2043: 30.9, 2044: 34.4, 2045: 38.4, 2046: 42.8, 2047: 47.7 },
        focusSectors: "Agriculture, bamboo, tourism",
        cumInvestment: null
    },
    {
        name: "Nagaland", code: "NL",
        popMillions: 2.3,
        gdpAnchors: { 2024: 4.7, 2025: 5.2, 2026: 5.8, 2027: 6.4, 2028: 7.1, 2029: 7.9, 2030: 8.8, 2031: 9.8, 2032: 10.8, 2033: 12.0, 2034: 13.3, 2035: 14.8, 2036: 16.4, 2037: 18.3, 2038: 20.3, 2039: 22.5, 2040: 25.0, 2041: 27.7, 2042: 30.8, 2043: 34.1, 2044: 37.9, 2045: 42.1, 2046: 46.7, 2047: 51.8 },
        focusSectors: "Agriculture, tourism, handicrafts",
        cumInvestment: null
    },
    {
        name: "Tripura", code: "TR",
        popMillions: 4.2,
        gdpAnchors: { 2024: 9.1, 2025: 10.2, 2026: 11.4, 2027: 12.8, 2028: 14.3, 2029: 16.0, 2030: 18.0, 2031: 20.1, 2032: 22.5, 2033: 25.2, 2034: 28.3, 2035: 31.7, 2036: 35.5, 2037: 39.7, 2038: 44.5, 2039: 49.8, 2040: 55.8, 2041: 62.5, 2042: 70.0, 2043: 78.4, 2044: 87.8, 2045: 98.3, 2046: 110.1, 2047: 123.3 },
        focusSectors: "Agriculture, rubber, natural gas",
        cumInvestment: null
    },
    {
        name: "Ladakh", code: "LA",
        popMillions: 0.3,
        gdpAnchors: { 2024: 0.9, 2025: 1.0, 2026: 1.1, 2027: 1.3, 2028: 1.4, 2029: 1.6, 2030: 1.8, 2031: 2.0, 2032: 2.2, 2033: 2.5, 2034: 2.8, 2035: 3.1, 2036: 3.5, 2037: 3.9, 2038: 4.4, 2039: 4.9, 2040: 5.5, 2041: 6.2, 2042: 6.9, 2043: 7.8, 2044: 8.7, 2045: 9.7, 2046: 10.9, 2047: 12.2 },
        focusSectors: "Tourism, defence, solar energy",
        cumInvestment: null
    },
    {
        name: "Andaman & Nicobar", code: "AN",
        popMillions: 0.4,
        gdpAnchors: { 2024: 1.5, 2025: 1.7, 2026: 1.8, 2027: 2.0, 2028: 2.2, 2029: 2.4, 2030: 2.7, 2031: 2.9, 2032: 3.2, 2033: 3.5, 2034: 3.9, 2035: 4.3, 2036: 4.7, 2037: 5.2, 2038: 5.7, 2039: 6.3, 2040: 6.9, 2041: 7.6, 2042: 8.3, 2043: 9.2, 2044: 10.1, 2045: 11.1, 2046: 12.2, 2047: 13.4 },
        focusSectors: "Tourism, fisheries, shipping",
        cumInvestment: null
    },
    {
        name: "Lakshadweep", code: "LD",
        popMillions: 0.1,
        gdpAnchors: { 2024: 0.1, 2025: 0.1, 2026: 0.1, 2027: 0.1, 2028: 0.1, 2029: 0.2, 2030: 0.2, 2031: 0.2, 2032: 0.2, 2033: 0.2, 2034: 0.3, 2035: 0.3, 2036: 0.3, 2037: 0.3, 2038: 0.4, 2039: 0.4, 2040: 0.5, 2041: 0.5, 2042: 0.6, 2043: 0.6, 2044: 0.7, 2045: 0.7, 2046: 0.8, 2047: 0.9 },
        focusSectors: "Tourism, fisheries, coconut",
        cumInvestment: null
    },
    {
        name: "Puducherry", code: "PY",
        popMillions: 1.7,
        gdpAnchors: { 2024: 5.6, 2025: 6.2, 2026: 6.8, 2027: 7.5, 2028: 8.2, 2029: 9.0, 2030: 9.9, 2031: 10.9, 2032: 12.0, 2033: 13.2, 2034: 14.5, 2035: 16.0, 2036: 17.6, 2037: 19.3, 2038: 21.3, 2039: 23.4, 2040: 25.7, 2041: 28.3, 2042: 31.1, 2043: 34.2, 2044: 37.7, 2045: 41.4, 2046: 45.6, 2047: 50.1 },
        focusSectors: "Tourism, IT, manufacturing",
        cumInvestment: null
    },
    {
        name: "Chandigarh", code: "CH",
        popMillions: 1.2,
        gdpAnchors: { 2024: 6.9, 2025: 7.7, 2026: 8.7, 2027: 9.7, 2028: 10.9, 2029: 12.2, 2030: 13.6, 2031: 15.3, 2032: 17.1, 2033: 19.1, 2034: 21.4, 2035: 24.0, 2036: 26.9, 2037: 30.1, 2038: 33.7, 2039: 37.8, 2040: 42.3, 2041: 47.4, 2042: 53.1, 2043: 59.4, 2044: 66.6, 2045: 74.5, 2046: 83.5, 2047: 93.5 },
        focusSectors: "IT, real estate, services",
        cumInvestment: null
    },
    {
        name: "D&NH and Daman & Diu", code: "DN",
        popMillions: 0.8,
        gdpAnchors: { 2024: 5.9, 2025: 6.5, 2026: 7.3, 2027: 8.1, 2028: 9.0, 2029: 9.9, 2030: 11.0, 2031: 12.2, 2032: 13.6, 2033: 15.1, 2034: 16.8, 2035: 18.6, 2036: 20.6, 2037: 22.9, 2038: 25.4, 2039: 28.2, 2040: 31.3, 2041: 34.8, 2042: 38.6, 2043: 42.9, 2044: 47.6, 2045: 52.8, 2046: 58.6, 2047: 65.1 },
        focusSectors: "Manufacturing, industrial, SME",
        cumInvestment: null
    }'''

# Find the region to replace: from JH entry through DN entry (last before ];)
# Pattern: from the reconciled comment block through the last UT entry
start_marker = '    // ════════════════════════════════════════════════════════\n    //  Each year: residual'
# Find first ═══ comment before JH
start_idx = content.find(start_marker)
if start_idx < 0:
    # Try alternate
    start_marker = '    // ════════════════'
    start_idx = content.find(start_marker)

# Find the end: look for the closing ]; of STATES_DATA
# The last entry is DN, followed by ];
end_marker = '];\n\n// ──────'
end_idx = content.find(end_marker)

if start_idx < 0:
    print(f"ERROR: Could not find start marker")
    exit(1)
if end_idx < 0:
    print(f"ERROR: Could not find end marker")
    exit(1)

# Replace from start to end_marker
old_section = content[start_idx:end_idx]
print(f"Found section to replace: {len(old_section)} chars, lines ~{content[:start_idx].count(chr(10))+1} to ~{content[:end_idx].count(chr(10))+1}")

new_content = content[:start_idx] + new_entries + '\n' + content[end_idx:]

# Verify we still have 36 states
count = len(re.findall(r'code:\s*"[A-Z]{2}"', new_content))
print(f"State entries in new data.js: {count}")

with open('js/data.js', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Successfully updated js/data.js")
