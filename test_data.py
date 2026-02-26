#!/usr/bin/env python3
"""Quick sanity check for data.js"""
import re

with open('js/data.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Check key values
assert '2047: 53500' in content, 'India 2047 should be 53500'
assert '2024: 3937' in content, 'India 2024 should be 3937'
assert '2025: 4270' in content, 'India 2025 should be 4270'
assert 'popMillions: 128.3' in content, 'MH pop should be 128.3'
assert 'popMillions: 247.9' in content, 'UP pop should be 247.9'
assert 'popMillions: 19.7' in content, 'DL pop should be 19.7'
assert 'popMillions: 129.2' in content, 'BR pop should be 129.2'
assert 'getStatePopulation' in content, 'getStatePopulation function should exist'

# Count states
state_count = len(re.findall(r'code: "[A-Z]{2}"', content))
print(f'Total states: {state_count}')

# Check various per capita (2024)
data = {
    'MH': (488.7, 128.3),
    'DL': (134.1, 19.7),
    'BR': (102.7, 129.2),
    'GA': (12.8, 1.6),
    'KL': (137.3, 36.5),
    'TN': (327.9, 78.7),
    'UP': (308.8, 247.9),
}
print('\nPer Capita 2024:')
for code, (gdp, pop) in data.items():
    pc = gdp * 1e9 / (pop * 1e6)
    print(f'  {code}: ${pc:,.0f}')

# Check Bihar vs Delhi (huge gap expected)
pc_br = 102.7e9 / 129.2e6
pc_dl = 134.1e9 / 19.7e6
print(f'\nBihar/Delhi ratio: {pc_br/pc_dl:.2f}x (should be ~0.12)')
assert pc_dl > pc_br * 5, 'Delhi per capita should be much higher than Bihar'

# Check sum of v4 states in 2047
v4_2047 = [5600, 5760, 5020, 5650, 4120, 4210, 2510, 2710, 2560, 3120, 1670, 1420, 1530, 1210, 1130, 1020]
print(f'\nV4 states 2047 sum: ${sum(v4_2047):.0f}B')

print('\n✓ ALL CHECKS PASSED!')
