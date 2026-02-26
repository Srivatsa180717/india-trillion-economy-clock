"""Check code mapping between data.js and map data."""
import re

with open('js/data.js', 'r', encoding='utf-8') as f:
    djs = f.read()
data_codes = set(re.findall(r'code:\s*"([^"]+)"', djs))

with open('js/india-map-data.js', 'r', encoding='utf-8') as f:
    mjs = f.read()
map_codes = set()
for m in re.finditer(r'"(?:d|c)":\s*"([^"]+)"', mjs):
    map_codes.add(m.group(1))

print('Data.js codes:', sorted(data_codes))
print('Map codes:', sorted(map_codes))
print('In map NOT in data:', sorted(map_codes - data_codes))
print('In data NOT in map:', sorted(data_codes - map_codes))
