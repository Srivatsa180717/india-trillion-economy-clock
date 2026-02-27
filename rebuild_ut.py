"""
Rebuild the 13 UT sub-entities with ACTUAL GSDP data from MOSPI/Wikipedia,
then re-reconcile JH, CG, AS, UK, HP, JK, GA so total = national.

Data source: Wikipedia "List of Indian states and union territories by GDP"
(MOSPI data, ₹ billion, FY 2023-24)
"""
import re, math

# ── Load data.js to get national GDP and 16 major states ─────────────
with open('js/data.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Strip JS comments for regex parsing
content_clean = re.sub(r'//[^\n]*', '', content)

# Extract INDIA_GDP
gdp_match = re.search(r'const INDIA_GDP\s*=\s*\{([^}]+)\}', content_clean)
india_gdp = {}
for m in re.finditer(r'(\d{4}):\s*([\d.]+)', gdp_match.group(1)):
    india_gdp[int(m.group(1))] = float(m.group(2))

# Extract all states
states = []
pattern = r'name:\s*"([^"]+)",\s*code:\s*"([^"]+)",\s*popMillions:\s*([\d.]+),\s*gdpAnchors:\s*\{([^}]+)\}'
for m in re.finditer(pattern, content_clean):
    name, code, pop, anchors_str = m.group(1), m.group(2), float(m.group(3)), m.group(4)
    anchors = {}
    for a in re.finditer(r'(\d{4}):\s*([\d.]+)', anchors_str):
        anchors[int(a.group(1))] = float(a.group(2))
    states.append({'name': name, 'code': code, 'popMillions': pop, 'gdpAnchors': anchors})

print(f"Loaded {len(states)} states from data.js")

# ── Identify the 16 major states (from Excel) ────────────────────────
MAJOR_16 = {'MH','TN','UP','KA','GJ','TS','WB','RJ','MP','AP','OD','DL','HR','BR','KL','PB'}
REMAINING_7 = {'JH','CG','AS','UK','HP','JK','GA'}
UT_13 = {'SK','AR','ML','MN','MZ','NL','TR','LA','AN','LD','PY','CH','DN'}

major_states = [s for s in states if s['code'] in MAJOR_16]
remaining_states = [s for s in states if s['code'] in REMAINING_7]
ut_states = [s for s in states if s['code'] in UT_13]

print(f"  16 major: {len(major_states)}, 7 remaining: {len(remaining_states)}, 13 UT: {len(ut_states)}")

# ── Compute 16 major states sum per year ──────────────────────────────
def get_state_gdp(state, year):
    anchors = state['gdpAnchors']
    years_sorted = sorted(anchors.keys())
    first_y, last_y = years_sorted[0], years_sorted[-1]
    if year <= first_y:
        share = anchors[first_y] / india_gdp[first_y]
        return share * india_gdp.get(year, india_gdp[min(india_gdp.keys(), key=lambda y: abs(y-year))])
    if year >= last_y:
        prev_y = years_sorted[-2]
        cagr = (anchors[last_y] / anchors[prev_y]) ** (1.0 / (last_y - prev_y)) - 1
        return anchors[last_y] * (1 + cagr) ** (year - last_y)
    for i in range(len(years_sorted) - 1):
        y0, y1 = years_sorted[i], years_sorted[i + 1]
        if y0 <= year <= y1:
            v0, v1 = anchors[y0], anchors[y1]
            cagr = (v1 / v0) ** (1.0 / (y1 - y0)) - 1
            return v0 * (1 + cagr) ** (year - y0)
    return 0

# ── ACTUAL GSDP data for 13 entities (MOSPI/Wikipedia) ────────────────
# FY 2023-24 GSDP in ₹ billion, converted to CY2024 $B at ~₹83.5/$
# CY2024 ≈ FY23-24 × 1.05 (half-year growth overlap) / 83.5
INR_USD = 83.5
GROWTH_OVERLAP = 1.05  # CY2024 vs FY2023-24 overlap adjustment

ut_actual = [
    # (code, name, GSDP_FY2324_INR_B, pop_M, growth_rate_USD%, focus_sectors)
    # Growth rates: MOSPI nominal INR growth minus ~2% for INR depreciation
    ("SK", "Sikkim",               427,  0.7, 11.5, "Tourism, organic farming, hydropower"),
    ("AR", "Arunachal Pradesh",    351,  1.7, 12.5, "Hydropower, tourism, agriculture"),
    ("ML", "Meghalaya",            466,  3.5, 12.0, "Mining, tourism, agriculture"),
    ("MN", "Manipur",              402,  3.2, 11.0, "Handloom, agriculture, tourism"),
    ("MZ", "Mizoram",              307,  1.3, 11.5, "Agriculture, bamboo, tourism"),
    ("NL", "Nagaland",             372,  2.3, 11.0, "Agriculture, tourism, handicrafts"),
    ("TR", "Tripura",              723,  4.2, 12.0, "Agriculture, rubber, natural gas"),
    ("LA", "Ladakh",                75,  0.3, 12.0, "Tourism, defence, solar energy"),
    ("AN", "Andaman & Nicobar",    117,  0.4, 10.0, "Tourism, fisheries, shipping"),
    ("LD", "Lakshadweep",            8,  0.1, 10.0, "Tourism, fisheries, coconut"),
    ("PY", "Puducherry",           447,  1.7, 10.0, "Tourism, IT, manufacturing"),
    ("CH", "Chandigarh",           550,  1.2, 12.0, "IT, real estate, services"),
    ("DN", "D&NH and Daman & Diu", 470,  0.8, 11.0, "Manufacturing, industrial, SME"),
]

# Convert to CY2024 $B
ut_2024 = {}
for code, name, inr_b, pop, gr, sectors in ut_actual:
    usd_b = round(inr_b * GROWTH_OVERLAP / INR_USD, 1)
    ut_2024[code] = {
        'name': name, 'pop': pop, 'gr': gr / 100, 'sectors': sectors,
        'gdp_2024': usd_b
    }

total_ut_2024 = sum(v['gdp_2024'] for v in ut_2024.values())
print(f"\n13 UT entities actual CY2024 sum: ${total_ut_2024:.1f}B")
print("Individual 2024 values:")
for code, name, inr_b, pop, gr, sectors in ut_actual:
    print(f"  {code:3s} {name:<25s}: INR {inr_b}B -> ${ut_2024[code]['gdp_2024']:.1f}B  pop={pop}M  gr={gr}%")

# ── Generate year-by-year GDP for 13 UT entities (2024-2047) ──────────
ut_anchors = {}
for code in ut_2024:
    d = ut_2024[code]
    anchors = {}
    for yr in range(2024, 2048):
        anchors[yr] = round(d['gdp_2024'] * (1 + d['gr']) ** (yr - 2024), 1)
    ut_anchors[code] = anchors

# Verify user's example: Arunachal Pradesh 2026
ar_2026 = ut_anchors['AR'][2026]
print(f"\nVerification: Arunachal Pradesh 2026 = ${ar_2026:.1f}B (user expects ~$5.7B)")

# ── Now reconcile the 7 remaining states ──────────────────────────────
# For each year: residual_7 = National - sum(16 major) - sum(13 UT)
# Distribute to JH, CG, AS, UK, HP, JK, GA proportionally by 2024 MOSPI GDP

# Original MOSPI 2024 estimates for the 7 states (from before reconciliation)
MOSPI_7 = {
    'JH': 50.0,   # ₹4,174B / 83.5 = $50.0B
    'CG': 55.6,   # ₹4,644B / 83.5 = $55.6B
    'AS': 57.3,   # ₹4,788B / 83.5 = $57.3B  (Wikipedia: 5702 for FY24-25 advance)
    'UK': 36.4,   # ₹3,038B / 83.5 = $36.4B
    'HP': 23.0,   # ₹1,917B / 83.5 = $23.0B
    'JK': 26.4,   # ₹2,202B / 83.5 = $26.4B
    'GA': 10.7,   # ₹891B / 83.5 = $10.7B
}
total_mospi_7 = sum(MOSPI_7.values())
weights_7 = {code: v / total_mospi_7 for code, v in MOSPI_7.items()}

print(f"\n7 remaining states MOSPI 2024 sum: ${total_mospi_7:.1f}B")
print("Weights:", {k: f"{v*100:.1f}%" for k, v in weights_7.items()})

# Compute reconciled values for each year
reconciled_7 = {code: {} for code in MOSPI_7}

# FLOOR: each state never < 1% of its 2024 GDP (avoids negative GDP)
FLOOR_RATIO = 0.01

print(f"\nReconciliation (per year):")
print(f"{'Year':>6} {'National':>10} {'16Major':>10} {'13UT':>10} {'Residual7':>10} {'Actual7':>10} {'Diff%':>8}")

for yr in range(2024, 2048):
    nat = india_gdp.get(yr, 0)
    sum_16 = sum(get_state_gdp(s, yr) for s in major_states)
    sum_13 = sum(ut_anchors[code][yr] for code in ut_anchors)
    resid = nat - sum_16 - sum_13

    for code in MOSPI_7:
        raw = resid * weights_7[code]
        # Floor: use MOSPI 2024 base × floor ratio
        floor_val = MOSPI_7[code] * FLOOR_RATIO
        reconciled_7[code][yr] = round(max(raw, floor_val), 1)

    actual_7 = sum(reconciled_7[code][yr] for code in MOSPI_7)
    total = sum_16 + sum_13 + actual_7
    diff_pct = (total - nat) / nat * 100

    if yr <= 2030 or yr >= 2045 or yr in [2031, 2032, 2033, 2034, 2035, 2040]:
        flag = " CLAMPED" if any(reconciled_7[code][yr] <= MOSPI_7[code] * FLOOR_RATIO + 0.1 for code in MOSPI_7) else ""
        print(f"  {yr} {nat:>10.1f} {sum_16:>10.1f} {sum_13:>10.1f} {resid:>10.1f} {actual_7:>10.1f} {diff_pct:>7.2f}%{flag}")

# Fix rounding for non-clamped years
for yr in range(2024, 2048):
    nat = india_gdp.get(yr, 0)
    sum_16 = sum(get_state_gdp(s, yr) for s in major_states)
    sum_13 = sum(ut_anchors[code][yr] for code in ut_anchors)
    actual_7 = sum(reconciled_7[code][yr] for code in MOSPI_7)
    diff = round(nat - sum_16 - sum_13 - actual_7, 1)
    # Only fix rounding if no states are at floor
    all_above_floor = all(reconciled_7[code][yr] > MOSPI_7[code] * FLOOR_RATIO + 0.2 for code in MOSPI_7)
    if abs(diff) > 0.05 and all_above_floor:
        reconciled_7['AS'][yr] = round(reconciled_7['AS'][yr] + diff, 1)

# ── Verify final totals ──────────────────────────────────────────────
print(f"\nFinal verification:")
max_diff = 0
for yr in range(2024, 2048):
    nat = india_gdp.get(yr, 0)
    sum_16 = sum(get_state_gdp(s, yr) for s in major_states)
    sum_13 = sum(ut_anchors[code][yr] for code in ut_anchors)
    sum_7 = sum(reconciled_7[code][yr] for code in MOSPI_7)
    total = sum_16 + sum_13 + sum_7
    diff = abs(nat - total)
    max_diff = max(max_diff, diff)
print(f"  Max diff across all years: {max_diff:.2f}")

# ── Check per-capita reasonableness ───────────────────────────────────
print(f"\nPer-capita check (2024):")
for code in MOSPI_7:
    state = [s for s in states if s['code'] == code][0]
    pop = state['popMillions']
    gdp = reconciled_7[code][2024]
    pc = gdp * 1e9 / (pop * 1e6) if pop > 0 else 0
    print(f"  {code}: ${gdp:.1f}B / {pop:.1f}M = ${pc:,.0f}/capita")

print(f"\n13 UT per-capita (2024):")
for code, name, inr_b, pop, gr, sectors in ut_actual:
    gdp = ut_anchors[code][2024]
    pc = gdp * 1e9 / (pop * 1e6) if pop > 0 else 0
    print(f"  {code}: ${gdp:.1f}B / {pop:.1f}M = ${pc:,.0f}/capita")

# ── Generate JS code ──────────────────────────────────────────────────
print("\n" + "=" * 80)
print("JS CODE: 13 UT entities (replace all 13 entries between Goa and ];)")
print("=" * 80)

for code, name, inr_b, pop, gr, sectors in ut_actual:
    a = ut_anchors[code]
    anchors_str = ", ".join(f"{yr}: {a[yr]}" for yr in sorted(a.keys()))
    print(f"    {{")
    print(f'        name: "{ut_2024[code]["name"]}", code: "{code}",')
    print(f'        popMillions: {ut_2024[code]["pop"]},')
    print(f"        gdpAnchors: {{ {anchors_str} }},")
    print(f'        focusSectors: "{sectors}",')
    print(f"        cumInvestment: null")
    print(f"    }},")

print("\n" + "=" * 80)
print("JS CODE: 7 remaining states (replace JH, CG, AS, UK, HP, JK, GA entries)")
print("=" * 80)

state_meta = {
    'JH': {'name': 'Jharkhand', 'pop': 40.9, 'sectors': 'Mining, steel, agriculture, tourism'},
    'CG': {'name': 'Chhattisgarh', 'pop': 31.6, 'sectors': 'Mining, steel, power, agriculture'},
    'AS': {'name': 'Assam', 'pop': 37.2, 'sectors': 'Tea, oil & gas, tourism, agro-industries'},
    'UK': {'name': 'Uttarakhand', 'pop': 12.0, 'sectors': 'Tourism, pharma, IT, renewable energy'},
    'HP': {'name': 'Himachal Pradesh', 'pop': 7.5, 'sectors': 'Tourism, hydro power, horticulture'},
    'JK': {'name': 'Jammu & Kashmir', 'pop': 14.9, 'sectors': 'Tourism, handicrafts, horticulture, IT'},
    'GA': {'name': 'Goa', 'pop': 1.6, 'sectors': 'Tourism, IT, pharma, mining'},
}

for code in ['JH', 'CG', 'AS', 'UK', 'HP', 'JK', 'GA']:
    meta = state_meta[code]
    a = reconciled_7[code]
    anchors_str = ", ".join(f"{yr}: {a[yr]}" for yr in sorted(a.keys()))
    print(f"    {{")
    print(f'        name: "{meta["name"]}", code: "{code}",')
    print(f'        popMillions: {meta["pop"]},')
    print(f"        gdpAnchors: {{ {anchors_str} }},")
    print(f'        focusSectors: "{meta["sectors"]}",')
    print(f"        cumInvestment: null")
    print(f"    }},")
