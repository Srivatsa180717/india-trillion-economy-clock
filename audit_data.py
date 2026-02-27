"""Audit state growth rates and per capita values from data.js"""
import re, math

with open('js/data.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Strip single-line JS comments so regex can span comment lines
content_clean = re.sub(r'//[^\n]*', '', content)

# Extract INDIA_GDP
gdp_match = re.search(r'const INDIA_GDP\s*=\s*\{([^}]+)\}', content)
india_gdp = {}
for m in re.finditer(r'(\d{4}):\s*([\d.]+)', gdp_match.group(1)):
    india_gdp[int(m.group(1))] = float(m.group(2))

# Extract INDIA_POPULATION
pop_match = re.search(r'const INDIA_POPULATION\s*=\s*\{([^}]+)\}', content)
india_pop = {}
for m in re.finditer(r'(\d{4}):\s*([\d.]+)', pop_match.group(1)):
    india_pop[int(m.group(1))] = float(m.group(2))

# Extract states
states = []
pattern = r'name:\s*"([^"]+)",\s*code:\s*"([^"]+)",\s*popMillions:\s*([\d.]+),\s*gdpAnchors:\s*\{([^}]+)\}'
for m in re.finditer(pattern, content_clean):
    name, code, pop, anchors_str = m.group(1), m.group(2), float(m.group(3)), m.group(4)
    anchors = {}
    for a in re.finditer(r'(\d{4}):\s*([\d.]+)', anchors_str):
        anchors[int(a.group(1))] = float(a.group(2))
    states.append({'name': name, 'code': code, 'popMillions': pop, 'gdpAnchors': anchors})

def get_india_gdp(year):
    y = max(2010, min(2047, year))
    fl = int(y)
    cl = min(fl + 1, 2047)
    if fl == cl or fl == y:
        return india_gdp.get(fl, 0)
    t = y - fl
    return india_gdp.get(fl, 0) * (1 - t) + india_gdp.get(cl, 0) * t

def get_state_gdp(state, year):
    anchors = state['gdpAnchors']
    years_sorted = sorted(anchors.keys())
    first_y, last_y = years_sorted[0], years_sorted[-1]

    if year <= first_y:
        share = anchors[first_y] / india_gdp[first_y]
        return share * get_india_gdp(year)

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

def get_state_pop(state, year):
    return state['popMillions'] * (india_pop.get(year, india_pop[2024]) / india_pop[2024])

print(f"Found {len(states)} states")
print()

header = f"{'State':<22} {'Pop(M)':>7} | {'GDP24':>8} {'GR24%':>7} {'PC24$':>8} | {'GDP26':>8} {'GR26%':>7} {'PC26$':>8} | {'GDP47':>9} {'GR47%':>7} {'PC47$':>9}"
print(header)
print("-" * len(header))

total_pop = sum(s['popMillions'] for s in states)

for s in sorted(states, key=lambda x: -get_state_gdp(x, 2024)):
    gdp24 = get_state_gdp(s, 2024)
    gdp23 = get_state_gdp(s, 2023)
    gr24 = ((gdp24 - gdp23) / gdp23 * 100) if gdp23 > 0 else 0
    pop24 = s['popMillions']
    pc24 = (gdp24 * 1e9) / (pop24 * 1e6) if pop24 > 0 else 0

    gdp26 = get_state_gdp(s, 2026)
    gdp25 = get_state_gdp(s, 2025)
    gr26 = ((gdp26 - gdp25) / gdp25 * 100) if gdp25 > 0 else 0
    pop26 = get_state_pop(s, 2026)
    pc26 = (gdp26 * 1e9) / (pop26 * 1e6) if pop26 > 0 else 0

    gdp47 = get_state_gdp(s, 2047)
    gdp46 = get_state_gdp(s, 2046)
    gr47 = ((gdp47 - gdp46) / gdp46 * 100) if gdp46 > 0 else 0
    pop47 = get_state_pop(s, 2047)
    pc47 = (gdp47 * 1e9) / (pop47 * 1e6) if pop47 > 0 else 0

    print(f"{s['name']:<22} {pop24:>7.1f} | {gdp24:>8.1f} {gr24:>7.1f} {pc24:>8,.0f} | {gdp26:>8.1f} {gr26:>7.1f} {pc26:>8,.0f} | {gdp47:>9.1f} {gr47:>7.1f} {pc47:>9,.0f}")

print("-" * len(header))
tg24 = sum(get_state_gdp(s, 2024) for s in states)
tg26 = sum(get_state_gdp(s, 2026) for s in states)
tg47 = sum(get_state_gdp(s, 2047) for s in states)
print(f"{'STATE SUM':<22} {total_pop:>7.1f} | {tg24:>8.1f} {'':>7} {'':>8} | {tg26:>8.1f} {'':>7} {'':>8} | {tg47:>9.1f}")
print(f"{'INDIA NATIONAL':<22} {'':>7} | {india_gdp[2024]:>8.1f} {'':>7} {'':>8} | {india_gdp[2026]:>8.1f} {'':>7} {'':>8} | {india_gdp[2047]:>9.1f}")
print(f"Sum/National ratio:         | {tg24/india_gdp[2024]*100:>7.1f}% {'':>7} {'':>8} | {tg26/india_gdp[2026]*100:>7.1f}% {'':>7} {'':>8} | {tg47/india_gdp[2047]*100:>7.1f}%")

# Check issues
print("\n=== POTENTIAL ISSUES ===")

# Check for unreasonably high growth rates
print("\nStates with growth rate > 25% in any year:")
for s in states:
    for yr in range(2025, 2048):
        gdp_now = get_state_gdp(s, yr)
        gdp_prev = get_state_gdp(s, yr - 1)
        if gdp_prev > 0:
            gr = (gdp_now - gdp_prev) / gdp_prev * 100
            if gr > 25:
                print(f"  {s['name']:<20} {yr}: {gr:.1f}%")

# Check for suspiciously similar per capita
print("\nPer capita 2024 (sorted):")
pcs = []
for s in states:
    gdp24 = get_state_gdp(s, 2024)
    pc = (gdp24 * 1e9) / (s['popMillions'] * 1e6) if s['popMillions'] > 0 else 0
    pcs.append((s['name'], pc))
for name, pc in sorted(pcs, key=lambda x: -x[1]):
    print(f"  {name:<22} ${pc:>8,.0f}")

# Check per capita spread
pcs_vals = [x[1] for x in pcs]
print(f"\nPer capita range: ${min(pcs_vals):,.0f} - ${max(pcs_vals):,.0f}")
print(f"Per capita ratio (max/min): {max(pcs_vals)/min(pcs_vals):.1f}x")
