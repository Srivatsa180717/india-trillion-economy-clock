"""
Split the 'Other States & UTs' aggregate into 13 individual entities.
Uses proportional shares based on approximate 2024 GSDP from MOSPI data.
Each entity gets the same proportion of the UT total for every year.
"""

# ── UT aggregate GDP anchors (from data.js) ──────────────────────────
ut_anchors = {
    2024: 100.5, 2025: 117.6, 2026: 133.3, 2027: 122.5, 2028: 104.3,
    2029: 78.0, 2030: 37.4, 2031: 16.1, 2032: 6.3, 2033: 5.1,
    2034: 12.2, 2035: 21.8, 2036: 41.1, 2037: 64.6, 2038: 93.5,
    2039: 128.7, 2040: 166.3, 2041: 212.1, 2042: 265.1, 2043: 326.1,
    2044: 399.3, 2045: 482.2, 2046: 580.3, 2047: 692.5
}

# ── 13 entities: code, name, approx 2024 GSDP ($B), population (M), focus sectors ──
entities = [
    ("SK", "Sikkim",              5.0, 0.7,  "Tourism, organic farming, hydropower"),
    ("AR", "Arunachal Pradesh",   5.0, 1.7,  "Hydropower, tourism, agriculture"),
    ("ML", "Meghalaya",           5.6, 3.5,  "Mining, tourism, agriculture"),
    ("MN", "Manipur",             4.3, 3.2,  "Handloom, agriculture, tourism"),
    ("MZ", "Mizoram",             3.6, 1.3,  "Agriculture, bamboo, tourism"),
    ("NL", "Nagaland",            4.6, 2.3,  "Agriculture, tourism, handicrafts"),
    ("TR", "Tripura",             9.0, 4.2,  "Agriculture, rubber, natural gas"),
    ("LA", "Ladakh",              1.2, 0.3,  "Tourism, defence, solar energy"),
    ("AN", "Andaman & Nicobar",   1.4, 0.4,  "Tourism, fisheries, shipping"),
    ("LD", "Lakshadweep",         0.4, 0.1,  "Tourism, fisheries, coconut"),
    ("PY", "Puducherry",          6.0, 1.7,  "Tourism, IT, manufacturing"),
    ("CH", "Chandigarh",          7.2, 1.2,  "IT, real estate, services"),
    ("DN", "D&NH and Daman & Diu",6.6, 0.8,  "Manufacturing, industrial, SME"),
]

# Verify population sums to 21.4
total_pop = sum(e[3] for e in entities)
print(f"Total population: {total_pop:.1f}M (should be 21.4)")

# Compute proportional shares
total_raw_gdp = sum(e[2] for e in entities)
print(f"Total raw GSDP: ${total_raw_gdp:.1f}B")
print()

shares = {}
for code, name, raw_gdp, pop, sectors in entities:
    shares[code] = raw_gdp / total_raw_gdp

# Verify shares sum to 1
print(f"Shares sum: {sum(shares.values()):.6f}")
print()

# ── Distribute UT anchors proportionally ──────────────────────────────
results = {}
for code, name, raw_gdp, pop, sectors in entities:
    share = shares[code]
    anchors = {}
    for yr, val in sorted(ut_anchors.items()):
        anchors[yr] = round(val * share, 1)
    results[code] = {
        'name': name,
        'pop': pop,
        'anchors': anchors,
        'sectors': sectors
    }

# Fix rounding: ensure per-year sums match UT totals exactly
for yr in sorted(ut_anchors.keys()):
    computed_sum = sum(results[code]['anchors'][yr] for code in [e[0] for e in entities])
    diff = round(ut_anchors[yr] - computed_sum, 1)
    if abs(diff) > 0.05:
        # Add rounding adjustment to the largest entity (Tripura)
        results['TR']['anchors'][yr] = round(results['TR']['anchors'][yr] + diff, 1)

# ── Verify ────────────────────────────────────────────────────────────
print("Year-by-year verification:")
max_diff = 0
for yr in sorted(ut_anchors.keys()):
    s = sum(results[code]['anchors'][yr] for code in [e[0] for e in entities])
    d = abs(s - ut_anchors[yr])
    max_diff = max(max_diff, d)
    flag = " *** MISMATCH" if d > 0.15 else ""
    print(f"  {yr}: UT={ut_anchors[yr]:>8.1f}  Sum={s:>8.1f}  Diff={d:>5.2f}{flag}")
print(f"Max diff: {max_diff:.2f}")
print()

# ── Print individual breakdowns ───────────────────────────────────────
print("Individual entity 2024 GDPs:")
for code, name, raw_gdp, pop, sectors in entities:
    r = results[code]
    print(f"  {code:3s} {name:<25s}: ${r['anchors'][2024]:>6.1f}B  pop={r['pop']:.1f}M  share={shares[code]*100:.1f}%")
print()

# ── Generate JS code ──────────────────────────────────────────────────
print("=" * 80)
print("JS CODE FOR data.js (replace the UT entry with these 13 entries):")
print("=" * 80)
print()

for code, name, raw_gdp, pop, sectors in entities:
    r = results[code]
    anchors_str = ", ".join(f"{yr}: {r['anchors'][yr]}" for yr in sorted(r['anchors'].keys()))
    print(f"    {{")
    print(f'        name: "{r["name"]}", code: "{code}",')
    print(f'        popMillions: {r["pop"]},')
    print(f"        gdpAnchors: {{ {anchors_str} }},")
    print(f'        focusSectors: "{r["sectors"]}",')
    print(f"        cumInvestment: null")
    print(f"    }},")

print()
print("=" * 80)
print("MAP DATA d: updates needed (india-map-data.js):")
print("=" * 80)
for code, name, raw_gdp, pop, sectors in entities:
    print(f'  "c":"{code}","d":"UT"  →  "c":"{code}","d":"{code}"')
