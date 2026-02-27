"""
Reconcile state GDPs so they sum exactly to national GDP for every year.
Strategy:
  - National GDP & 16 major states: UNTOUCHED
  - 8 remaining (JH, CG, AS, UK, HP, JK, GA, UT): year-by-year anchors
    distributed proportionally from the residual (National - 16 Major Sum)
  - Each remaining state's proportional weight = its 2024 MOSPI GDP / sum of
    all 8 remaining states' 2024 GDPs (stable, population-correlated weights)

Outputs the updated data.js file directly.
"""
import re, math, copy

with open('js/data.js', 'r', encoding='utf-8') as f:
    content = f.read()

# ── Extract INDIA_GDP ──
india_gdp = {}
for m in re.finditer(r'(\d{4}):\s*([\d.]+)', re.search(r'const INDIA_GDP\s*=\s*\{([^}]+)\}', content).group(1)):
    india_gdp[int(m.group(1))] = float(m.group(2))

# ── Extract ALL states (robust parser that handles comments) ──
in_array = content.find('const STATES_DATA = [')
array_content = content[in_array:]
depth = 0
start = array_content.index('[')
for i in range(start, len(array_content)):
    if array_content[i] == '[': depth += 1
    elif array_content[i] == ']': depth -= 1
    if depth == 0:
        array_end = i
        break
array_str = array_content[start:array_end+1]

states = []
obj_starts = [m.start() for m in re.finditer(r'(?<!\w)\{(?!\{)', array_str)]
for idx, os in enumerate(obj_starts):
    d = 0
    oe = os
    for i in range(os, len(array_str)):
        if array_str[i] == '{': d += 1
        elif array_str[i] == '}': d -= 1
        if d == 0:
            oe = i
            break
    block = array_str[os:oe+1]
    
    name_m = re.search(r'name:\s*"([^"]+)"', block)
    code_m = re.search(r'code:\s*"([^"]+)"', block)
    pop_m = re.search(r'popMillions:\s*([\d.]+)', block)
    anch_m = re.search(r'gdpAnchors:\s*\{([^}]+)\}', block)
    
    if name_m and code_m and pop_m and anch_m:
        anchors = {}
        for a in re.finditer(r'(\d{4}):\s*([\d.]+)', anch_m.group(1)):
            anchors[int(a.group(1))] = float(a.group(2))
        states.append({
            'name': name_m.group(1),
            'code': code_m.group(1),
            'popMillions': float(pop_m.group(1)),
            'gdpAnchors': anchors
        })

MAJOR_CODES = {'MH','TN','UP','KA','GJ','TS','WB','RJ','MP','AP','OD','DL','HR','BR','KL','PB'}
major_states = [s for s in states if s['code'] in MAJOR_CODES]
remaining_states = [s for s in states if s['code'] not in MAJOR_CODES]

print(f"Total states found: {len(states)}")
print(f"Major (16): {[s['code'] for s in major_states]}")
print(f"Remaining ({len(remaining_states)}): {[s['name'] + ' (' + s['code'] + ')' for s in remaining_states]}")

assert len(major_states) == 16, f"Expected 16 major states, got {len(major_states)}"
assert len(remaining_states) == 8, f"Expected 8 remaining, got {len(remaining_states)}"

# ── Helper: compute state GDP (mirrors JS getStateGDPForYear) ──
def get_state_gdp(anchors, year):
    years_sorted = sorted(anchors.keys())
    first_y, last_y = years_sorted[0], years_sorted[-1]
    if year <= first_y:
        share = anchors[first_y] / india_gdp[first_y]
        return share * india_gdp.get(year, india_gdp[first_y])
    if year >= last_y:
        prev_y = years_sorted[-2]
        cagr = (anchors[last_y] / anchors[prev_y]) ** (1.0 / (last_y - prev_y)) - 1
        return anchors[last_y] * (1 + cagr) ** (year - last_y)
    for i in range(len(years_sorted) - 1):
        y0, y1 = years_sorted[i], years_sorted[i+1]
        if y0 <= year <= y1:
            v0, v1 = anchors[y0], anchors[y1]
            cagr = (v1 / v0) ** (1.0 / (y1 - y0)) - 1
            return v0 * (1 + cagr) ** (year - y0)
    return 0

# ── Compute residuals ──
all_years = sorted(y for y in india_gdp if 2024 <= y <= 2047)

print(f"\n{'Year':>6} {'National':>10} {'16-Major':>10} {'Residual':>10} {'Res%':>7}")
print("-" * 50)
residuals = {}
for yr in all_years:
    nat = india_gdp[yr]
    major_sum = sum(get_state_gdp(s['gdpAnchors'], yr) for s in major_states)
    residual = nat - major_sum
    residuals[yr] = residual
    print(f"{yr:>6} {nat:>10.1f} {major_sum:>10.1f} {residual:>10.1f} {residual/nat*100:>6.1f}%")

# ── Compute weights from 2024 GDP base ──
base_gdps = {}
for s in remaining_states:
    base_gdps[s['code']] = s['gdpAnchors'].get(2024, 0)
base_total = sum(base_gdps.values())
weights = {code: gdp / base_total for code, gdp in base_gdps.items()}

print(f"\nDistribution weights (based on 2024 GDP):")
for s in remaining_states:
    print(f"  {s['name']:<22} ({s['code']}): {weights[s['code']]*100:.1f}%  (2024 base: ${base_gdps[s['code']]:.1f}B)")

# ── Distribute residual proportionally ──
new_anchors = {}
for s in remaining_states:
    new_anchors[s['code']] = {}
    for yr in all_years:
        val = residuals[yr] * weights[s['code']]
        new_anchors[s['code']][yr] = round(val, 1)

# ── Fix rounding: ensure sum = national exactly ──
# Adjust "Other States & UTs" (UT) to absorb any rounding error
for yr in all_years:
    nat = india_gdp[yr]
    major_sum = sum(get_state_gdp(s['gdpAnchors'], yr) for s in major_states)
    others_sum = sum(new_anchors[s['code']][yr] for s in remaining_states if s['code'] != 'UT')
    # UT gets the exact remainder
    new_anchors['UT'][yr] = round(nat - major_sum - others_sum, 1)

# ── Verification ──
print(f"\n{'='*80}")
print("VERIFICATION")
print(f"{'='*80}")
print(f"{'Year':>6} {'National':>10} {'16Maj':>10} {'8Rem':>10} {'Total':>10} {'Diff':>8}")
print("-" * 56)
max_diff = 0
for yr in all_years:
    nat = india_gdp[yr]
    major_sum = sum(get_state_gdp(s['gdpAnchors'], yr) for s in major_states)
    rem_sum = sum(new_anchors[s['code']][yr] for s in remaining_states)
    total = major_sum + rem_sum
    diff = nat - total
    max_diff = max(max_diff, abs(diff))
    print(f"{yr:>6} {nat:>10.1f} {major_sum:>10.1f} {rem_sum:>10.1f} {total:>10.1f} {diff:>8.2f}")

print(f"\nMax diff: {max_diff:.2f}  ({'OK' if max_diff < 1 else 'NEEDS FIX'})")

# ── Per-capita check ──
india_pop = {}
for m in re.finditer(r'(\d{4}):\s*([\d.]+)', re.search(r'const INDIA_POPULATION\s*=\s*\{([^}]+)\}', content).group(1)):
    india_pop[int(m.group(1))] = float(m.group(2))

print(f"\nPer capita at key years:")
for yr in [2024, 2026, 2030, 2033, 2035, 2040, 2047]:
    pop_ratio = india_pop[yr] / india_pop[2024]
    print(f"\n  {yr}:")
    for s in remaining_states:
        gdp = new_anchors[s['code']][yr]
        pop = s['popMillions'] * pop_ratio
        pc = (gdp * 1e9) / (pop * 1e6) if pop > 0 else 0
        print(f"    {s['name']:<22} GDP: ${gdp:>8.1f}B  PC: ${pc:>8,.0f}")

# ── Output the lines for data.js ──
print(f"\n{'='*80}")
print("REPLACEMENT anchor lines:")
print(f"{'='*80}")
for s in remaining_states:
    a = new_anchors[s['code']]
    parts = [f"{yr}: {a[yr]}" for yr in all_years]
    print(f"\n{s['name']} ({s['code']}):")
    print(f"  {{ {', '.join(parts)} }}")
