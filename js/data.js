/**
 * GFST Indian Trillion Economy Clock — Data Module
 * GDP in billions USD (nominal)
 *
 * Sources:
 *   - Historical (2010-2024): World Bank / IMF actual data
 *   - State projections (16 major): gdp_projections_v4.xlsx — year-by-year 2026-2047
 *   - State projections (8 remaining): estimated from MOSPI Statewise GVA 2023-24 + CAGR
 *   - State populations: Census 2011 + RGI/SRS differential growth, normalised to UN WPP total
 *   - National trajectory: $4T (2024) -> $53.5T (2047), constant 12.38% CAGR from 2026
 */

// ──────────────────────────────────────────────────────────
// INDIA NATIONAL GDP  (billions USD, nominal)
// Historical 2010-2024: World Bank / IMF
// Projected 2025-2047: Smooth constant CAGR ~12.38% from 2026 to 2047
//   Near-term: IMF WEO estimates for 2025-2026
//   Target: $53.5T by 2047 (constant 12.38% CAGR from 2026)
// ──────────────────────────────────────────────────────────
const INDIA_GDP = {
    2010: 1676,
    2011: 1823,
    2012: 1828,
    2013: 1857,
    2014: 2039,
    2015: 2104,
    2016: 2295,
    2017: 2652,
    2018: 2703,
    2019: 2871,
    2020: 2660,
    2021: 3150,
    2022: 3385,
    2023: 3550,
    2024: 3937,
    // Projected — constant 12.38% CAGR from 2026 → $53.5T by 2047
    2025: 4270,
    2026: 4612,
    2027: 5180,
    2028: 5820,
    2029: 6550,
    2030: 7360,
    2031: 8270,
    2032: 9290,
    2033: 10440,
    2034: 11730,
    2035: 13190,
    2036: 14820,
    2037: 16650,
    2038: 18710,
    2039: 21030,
    2040: 23630,
    2041: 26560,
    2042: 29850,
    2043: 33540,
    2044: 37700,
    2045: 42360,
    2046: 47610,
    2047: 53500
};

// India population by year (millions) — UN World Population Prospects 2024
const INDIA_POPULATION = {
    2010: 1234, 2011: 1250, 2012: 1265, 2013: 1280, 2014: 1295,
    2015: 1310, 2016: 1324, 2017: 1339, 2018: 1353, 2019: 1366,
    2020: 1380, 2021: 1394, 2022: 1406, 2023: 1419, 2024: 1432,
    2025: 1444, 2026: 1456, 2027: 1467, 2028: 1478, 2029: 1488,
    2030: 1498, 2031: 1506, 2032: 1514, 2033: 1520, 2034: 1526,
    2035: 1530, 2036: 1534, 2037: 1536, 2038: 1538, 2039: 1539,
    2040: 1540, 2041: 1540, 2042: 1540, 2043: 1539, 2044: 1538,
    2045: 1536, 2046: 1533, 2047: 1530
};

// India's approximate global GDP rank by year
const INDIA_RANK = {
    2010: 9, 2011: 9, 2012: 10, 2013: 10, 2014: 9, 2015: 7, 2016: 7,
    2017: 6, 2018: 7, 2019: 5, 2020: 6, 2021: 6, 2022: 5, 2023: 5,
    2024: 5, 2025: 5, 2026: 4, 2027: 4, 2028: 3, 2029: 3, 2030: 3,
    2031: 3, 2032: 3, 2033: 3, 2034: 3, 2035: 3, 2036: 3, 2037: 3,
    2038: 3, 2039: 3, 2040: 3, 2041: 3, 2042: 3, 2043: 3, 2044: 3,
    2045: 3, 2046: 3, 2047: 3
};

// ──────────────────────────────────────────────────────────
// STATE GDP DATA
// 16 major states: year-by-year from gdp_projections_v4.xlsx (2026-2047)
//   + 2024 base from MOSPI Statewise GVA 2023-24 (Rs crore -> USD B @ Rs83/$)
// 8 remaining: MOSPI 2024 base + CAGR-projected anchors
// Each state includes popMillions (2024 est.) for per-capita calculation
// ──────────────────────────────────────────────────────────
const STATES_DATA = [
    // ════════════════════════════════════════════════════════
    //  16 MAJOR STATES — gdp_projections_v4.xlsx (year-by-year)
    // ════════════════════════════════════════════════════════
    {
        name: "Maharashtra", code: "MH",
        popMillions: 128.3,
        gdpAnchors: { 2024: 488.7, 2026: 556.1, 2027: 644, 2028: 745.7, 2029: 863.6, 2030: 1000, 2031: 1106.7, 2032: 1224.7, 2033: 1355.3, 2034: 1499.8, 2035: 1659.8, 2036: 1836.8, 2037: 2032.7, 2038: 2249.5, 2039: 2489.4, 2040: 2754.9, 2041: 3048.7, 2042: 3373.9, 2043: 3733.7, 2044: 4131.9, 2045: 4572.6, 2046: 5060.3, 2047: 5600 },
        focusSectors: "Finance, IT, media, autos, engineering, chemicals, ports/logistics",
        cumInvestment: 2.8
    },
    {
        name: "Tamil Nadu", code: "TN",
        popMillions: 78.7,
        gdpAnchors: { 2024: 327.9, 2026: 374.3, 2027: 478.5, 2028: 611.8, 2029: 782.2, 2030: 1000, 2031: 1108.5, 2032: 1228.7, 2033: 1362, 2034: 1509.8, 2035: 1673.6, 2036: 1855.2, 2037: 2056.4, 2038: 2279.5, 2039: 2526.8, 2040: 2801, 2041: 3104.8, 2042: 3441.7, 2043: 3815, 2044: 4228.9, 2045: 4687.7, 2046: 5196.3, 2047: 5760 },
        focusSectors: "Autos, electronics, textiles, IT, EV hubs, export clusters, R&D",
        cumInvestment: 4.0
    },
    {
        name: "Uttar Pradesh", code: "UP",
        popMillions: 247.9,
        gdpAnchors: { 2024: 308.8, 2026: 350.4, 2027: 432.2, 2028: 533, 2029: 657.4, 2030: 810.8, 2031: 1000, 2032: 1106.1, 2033: 1223.5, 2034: 1353.3, 2035: 1496.8, 2036: 1655.7, 2037: 1831.3, 2038: 2025.6, 2039: 2240.5, 2040: 2478.3, 2041: 2741.2, 2042: 3032, 2043: 3353.7, 2044: 3709.6, 2045: 4103.1, 2046: 4538.5, 2047: 5020 },
        focusSectors: "Construction, electronics, food processing, logistics, human capital",
        cumInvestment: 4.2
    },
    {
        name: "Karnataka", code: "KA",
        popMillions: 69.8,
        gdpAnchors: { 2024: 308.1, 2026: 343.9, 2027: 410.9, 2028: 490.9, 2029: 586.4, 2030: 700.6, 2031: 837, 2032: 1000, 2033: 1122.4, 2034: 1259.7, 2035: 1413.9, 2036: 1586.9, 2037: 1781.1, 2038: 1999, 2039: 2243.7, 2040: 2518.2, 2041: 2826.4, 2042: 3172.2, 2043: 3560.4, 2044: 3996.1, 2045: 4485.1, 2046: 5034, 2047: 5650 },
        focusSectors: "IT/ITES, startups, deep tech, biotech, digital exports, R&D",
        cumInvestment: 4.2
    },
    {
        name: "Gujarat", code: "GJ",
        popMillions: 69.0,
        gdpAnchors: { 2024: 292.3, 2026: 333.6, 2027: 390.2, 2028: 456.5, 2029: 534, 2030: 624.7, 2031: 730.8, 2032: 854.8, 2033: 1000, 2034: 1106.4, 2035: 1224.2, 2036: 1354.5, 2037: 1498.6, 2038: 1658.1, 2039: 1834.5, 2040: 2029.8, 2041: 2245.8, 2042: 2484.8, 2043: 2749.2, 2044: 3041.8, 2045: 3365.5, 2046: 3723.7, 2047: 4120 },
        focusSectors: "Petrochemicals, pharma, ports, green hydrogen, export manufacturing",
        cumInvestment: 4.3
    },
    {
        name: "Telangana", code: "TS",
        popMillions: 40.2,
        gdpAnchors: { 2024: 176.4, 2026: 206.5, 2027: 246.1, 2028: 293.2, 2029: 349.4, 2030: 416.3, 2031: 496, 2032: 591.1, 2033: 704.3, 2034: 839.2, 2035: 1000, 2036: 1127.3, 2037: 1270.7, 2038: 1432.4, 2039: 1614.7, 2040: 1820.2, 2041: 2051.8, 2042: 2312.9, 2043: 2607.3, 2044: 2939.1, 2045: 3313.1, 2046: 3734.7, 2047: 4210 },
        focusSectors: "IT/ITES, GCCs, pharma/biotech, life sciences, AI platforms",
        cumInvestment: 5.1
    },
    {
        name: "West Bengal", code: "WB",
        popMillions: 104.2,
        gdpAnchors: { 2024: 199.0, 2026: 233.9, 2027: 261.9, 2028: 293.2, 2029: 328.3, 2030: 367.6, 2031: 411.5, 2032: 460.8, 2033: 515.9, 2034: 577.6, 2035: 646.7, 2036: 724.1, 2037: 810.8, 2038: 907.8, 2039: 1016.4, 2040: 1138, 2041: 1274.1, 2042: 1426.5, 2043: 1597.2, 2044: 1788.3, 2045: 2002.2, 2046: 2241.8, 2047: 2510 },
        focusSectors: "Trade, logistics, manufacturing, port-led development, IT/BPM",
        cumInvestment: 4.9
    },
    {
        name: "Rajasthan", code: "RJ",
        popMillions: 85.0,
        gdpAnchors: { 2024: 183.3, 2026: 210.2, 2027: 237.4, 2028: 268.2, 2029: 302.9, 2030: 342.1, 2031: 386.4, 2032: 436.4, 2033: 492.9, 2034: 556.7, 2035: 628.8, 2036: 710.2, 2037: 802.1, 2038: 906, 2039: 1023.3, 2040: 1155.7, 2041: 1305.4, 2042: 1474.4, 2043: 1665.2, 2044: 1880.8, 2045: 2124.3, 2046: 2399.4, 2047: 2710 },
        focusSectors: "Mining, solar/wind, tourism, green energy, agro-processing",
        cumInvestment: 5.1
    },
    {
        name: "Madhya Pradesh", code: "MP",
        popMillions: 90.1,
        gdpAnchors: { 2024: 163.1, 2026: 187.5, 2027: 212.4, 2028: 240.5, 2029: 272.4, 2030: 308.5, 2031: 349.4, 2032: 395.7, 2033: 448.1, 2034: 507.5, 2035: 574.8, 2036: 651, 2037: 737.3, 2038: 835, 2039: 945.7, 2040: 1071.1, 2041: 1213.1, 2042: 1373.9, 2043: 1556, 2044: 1762.2, 2045: 1995.8, 2046: 2260.4, 2047: 2560 },
        focusSectors: "Agriculture, mining, logistics, food processing, mineral industries",
        cumInvestment: 5.2
    },
    {
        name: "Andhra Pradesh", code: "AP",
        popMillions: 56.4,
        gdpAnchors: { 2024: 171.3, 2026: 198, 2027: 224.3, 2028: 254, 2029: 287.7, 2030: 325.9, 2031: 369.1, 2032: 418.1, 2033: 473.6, 2034: 536.4, 2035: 607.6, 2036: 688.2, 2037: 779.5, 2038: 882.9, 2039: 1000, 2040: 1152.8, 2041: 1329, 2042: 1532.2, 2043: 1766.4, 2044: 2036.3, 2045: 2347.6, 2046: 2706.4, 2047: 3120 },
        focusSectors: "Ports, aquaculture, industrialization, food/marine processing",
        cumInvestment: 5.1
    },
    {
        name: "Odisha", code: "OD",
        popMillions: 47.9,
        gdpAnchors: { 2024: 103.9, 2026: 117.4, 2027: 133.2, 2028: 151.2, 2029: 171.5, 2030: 194.7, 2031: 220.9, 2032: 250.7, 2033: 284.5, 2034: 322.8, 2035: 366.3, 2036: 415.7, 2037: 471.7, 2038: 535.2, 2039: 607.4, 2040: 689.2, 2041: 782.1, 2042: 887.5, 2043: 1007.1, 2044: 1142.9, 2045: 1296.9, 2046: 1471.7, 2047: 1670 },
        focusSectors: "Mining, metals, ports, green steel, port-based industry",
        cumInvestment: 5.6
    },
    {
        name: "Delhi", code: "DL",
        popMillions: 19.7,
        gdpAnchors: { 2024: 134.1, 2026: 152.3, 2027: 169.4, 2028: 188.4, 2029: 209.5, 2030: 233, 2031: 259.2, 2032: 288.2, 2033: 320.6, 2034: 356.5, 2035: 396.5, 2036: 441, 2037: 490.4, 2038: 545.4, 2039: 606.6, 2040: 674.7, 2041: 750.3, 2042: 834.5, 2043: 928.1, 2044: 1032.2, 2045: 1148, 2046: 1276.8, 2047: 1420 },
        focusSectors: "High-end services, finance, IT, digital & knowledge economy",
        cumInvestment: 5.4
    },
    {
        name: "Haryana", code: "HR",
        popMillions: 30.3,
        gdpAnchors: { 2024: 130.8, 2026: 150.7, 2027: 168.3, 2028: 187.9, 2029: 209.9, 2030: 234.3, 2031: 261.7, 2032: 292.2, 2033: 326.3, 2034: 364.4, 2035: 406.9, 2036: 454.4, 2037: 507.4, 2038: 566.6, 2039: 632.8, 2040: 706.6, 2041: 789, 2042: 881.1, 2043: 983.9, 2044: 1098.7, 2045: 1226.9, 2046: 1370.1, 2047: 1530 },
        focusSectors: "Autos, IT/BPM, NCR services, EVs, agritech, logistics",
        cumInvestment: 5.4
    },
    {
        name: "Bihar", code: "BR",
        popMillions: 129.2,
        gdpAnchors: { 2024: 102.7, 2026: 117.5, 2027: 131.3, 2028: 146.7, 2029: 164, 2030: 183.2, 2031: 204.7, 2032: 228.8, 2033: 255.6, 2034: 285.7, 2035: 319.2, 2036: 356.7, 2037: 398.6, 2038: 445.4, 2039: 497.7, 2040: 556.2, 2041: 621.5, 2042: 694.5, 2043: 776, 2044: 867.2, 2045: 969, 2046: 1082.8, 2047: 1210 },
        focusSectors: "Basic manufacturing, infrastructure, urbanization, education/skills",
        cumInvestment: 5.6
    },
    {
        name: "Kerala", code: "KL",
        popMillions: 36.5,
        gdpAnchors: { 2024: 137.3, 2026: 157.6, 2027: 173.1, 2028: 190.1, 2029: 208.8, 2030: 229.4, 2031: 251.9, 2032: 276.7, 2033: 303.9, 2034: 333.8, 2035: 366.6, 2036: 402.7, 2037: 442.3, 2038: 485.8, 2039: 533.5, 2040: 586, 2041: 643.6, 2042: 706.9, 2043: 776.5, 2044: 852.8, 2045: 936.7, 2046: 1028.8, 2047: 1130 },
        focusSectors: "Tourism, health/education services, high-value agriculture, IT",
        cumInvestment: 5.4
    },
    {
        name: "Punjab", code: "PB",
        popMillions: 31.6,
        gdpAnchors: { 2024: 89.9, 2026: 102.4, 2027: 114.2, 2028: 127.5, 2029: 142.2, 2030: 158.7, 2031: 177, 2032: 197.5, 2033: 220.3, 2034: 245.8, 2035: 274.2, 2036: 306, 2037: 341.4, 2038: 380.9, 2039: 424.9, 2040: 474.1, 2041: 528.9, 2042: 590.1, 2043: 658.3, 2044: 734.5, 2045: 819.5, 2046: 914.2, 2047: 1020 },
        focusSectors: "Agriculture, food processing, high-value crops, SMEs, renewables",
        cumInvestment: 5.7
    },

    // ════════════════════════════════════════════════════════
    //  8 REMAINING STATES — estimated from MOSPI GVA 2023-24 + CAGR projection
    // ════════════════════════════════════════════════════════
    {
        name: "Jharkhand", code: "JH",
        popMillions: 40.9,
        gdpAnchors: { 2024: 55.5, 2026: 69, 2030: 106.6, 2035: 183.8, 2040: 316.7, 2047: 678.6 },
        focusSectors: "Mining, steel, heavy industry, minerals",
        cumInvestment: null
    },
    {
        name: "Chhattisgarh", code: "CG",
        popMillions: 31.6,
        gdpAnchors: { 2024: 61.7, 2026: 75.3, 2030: 112.3, 2035: 185, 2040: 304.8, 2047: 613.2 },
        focusSectors: "Mining, steel, power, agriculture",
        cumInvestment: null
    },
    {
        name: "Assam", code: "AS",
        popMillions: 37.2,
        gdpAnchors: { 2024: 68.8, 2026: 83.2, 2030: 121.9, 2035: 196.3, 2040: 316.1, 2047: 616.1 },
        focusSectors: "Tea, oil & gas, tourism, agro-industries",
        cumInvestment: null
    },
    {
        name: "Uttarakhand", code: "UK",
        popMillions: 12.0,
        gdpAnchors: { 2024: 40.1, 2026: 49.4, 2030: 75, 2035: 126.4, 2040: 213, 2047: 442.2 },
        focusSectors: "Tourism, pharma, IT, renewable energy",
        cumInvestment: null
    },
    {
        name: "Himachal Pradesh", code: "HP",
        popMillions: 7.5,
        gdpAnchors: { 2024: 25.4, 2026: 30.5, 2030: 43.8, 2035: 68.9, 2040: 108.5, 2047: 204.8 },
        focusSectors: "Tourism, hydro power, horticulture",
        cumInvestment: null
    },
    {
        name: "Jammu & Kashmir", code: "JK",
        popMillions: 14.9,
        gdpAnchors: { 2024: 28.8, 2026: 34.8, 2030: 51, 2035: 82.2, 2040: 132.3, 2047: 257.9 },
        focusSectors: "Tourism, handicrafts, horticulture, IT",
        cumInvestment: null
    },
    {
        name: "Goa", code: "GA",
        popMillions: 1.6,
        gdpAnchors: { 2024: 12.8, 2026: 15.3, 2030: 22.1, 2035: 34.7, 2040: 54.7, 2047: 103.2 },
        focusSectors: "Tourism, IT, pharma, mining",
        cumInvestment: null
    },
    {
        name: "Other States & UTs", code: "UT",
        // Aggregates: NE states (Sikkim, Arunachal, Meghalaya, Manipur, Mizoram,
        //   Nagaland, Tripura), Ladakh, A&N, Lakshadweep, Puducherry, Chandigarh, D&NH&DD
        popMillions: 21.4,
        gdpAnchors: { 2024: 56.9, 2026: 68.2, 2030: 98.1, 2035: 154.4, 2040: 243.1, 2047: 458.8 },
        focusSectors: "Various — tourism, agriculture, defence, infrastructure",
        cumInvestment: null
    }
];

// ──────────────────────────────────────────────────────────
// Lookup helpers
// ──────────────────────────────────────────────────────────

/** Get India national GDP (billions) for any year (linear interpolation) */
function getIndiaGDP(year) {
    const y = Math.max(2010, Math.min(2047, year));
    const floor = Math.floor(y);
    const ceil = Math.ceil(y);
    if (floor === ceil) return INDIA_GDP[floor];
    const t = y - floor;
    return INDIA_GDP[floor] * (1 - t) + INDIA_GDP[ceil] * t;
}

/** Get population (millions) */
function getPopulation(year) {
    const y = Math.max(2010, Math.min(2047, year));
    const floor = Math.floor(y);
    const ceil = Math.ceil(y);
    if (floor === ceil) return INDIA_POPULATION[floor];
    const t = y - floor;
    return INDIA_POPULATION[floor] * (1 - t) + INDIA_POPULATION[ceil] * t;
}

/** Get global rank */
function getRank(year) {
    const y = Math.max(2010, Math.min(2047, Math.round(year)));
    return INDIA_RANK[y] || 5;
}

/** National GDP growth rate (YoY %) */
function getGrowthRate(year) {
    const y = Math.round(Math.max(2011, Math.min(2047, year)));
    const prev = INDIA_GDP[y - 1];
    const curr = INDIA_GDP[y];
    if (!prev || !curr) return 0;
    return ((curr - prev) / prev) * 100;
}

/** State GDP growth rate (YoY %) — computed from state GDP function */
function getStateGrowthRate(state, year) {
    const gdpNow = getStateGDPForYear(state, year);
    const gdpPrev = getStateGDPForYear(state, year - 1);
    if (!gdpPrev || gdpPrev <= 0) return 0;
    return ((gdpNow - gdpPrev) / gdpPrev) * 100;
}

/** Get estimated state population (millions) for any year.
 *  Uses popMillions as 2024 base, scales proportionally with national pop growth. */
function getStatePopulation(state, year) {
    const basePop = state.popMillions || 0;
    const natPop2024 = INDIA_POPULATION[2024];
    const natPopYear = getPopulation(year);
    return basePop * (natPopYear / natPop2024);
}

// ──────────────────────────────────────────────────────────
// State GDP computation
// ──────────────────────────────────────────────────────────

/**
 * Get state GDP (billions) for ANY year by:
 *   1) For years between anchor points -> exponential (CAGR) interpolation
 *   2) For years before the first anchor -> use the first-anchor share of national GDP
 */
function getStateGDPForYear(state, year) {
    const anchors = state.gdpAnchors;
    const anchorYears = Object.keys(anchors).map(Number).sort((a, b) => a - b);
    const firstAnchorYear = anchorYears[0];
    const lastAnchorYear = anchorYears[anchorYears.length - 1];

    if (year <= firstAnchorYear) {
        // Before first anchor: use the state's share of national GDP at first anchor
        const share = anchors[firstAnchorYear] / INDIA_GDP[firstAnchorYear];
        return share * getIndiaGDP(year);
    }

    if (year >= lastAnchorYear) {
        // After last anchor: extrapolate with the last segment's CAGR
        const prevYear = anchorYears[anchorYears.length - 2];
        const cagr = Math.pow(anchors[lastAnchorYear] / anchors[prevYear], 1 / (lastAnchorYear - prevYear)) - 1;
        return anchors[lastAnchorYear] * Math.pow(1 + cagr, year - lastAnchorYear);
    }

    // Find surrounding anchors and CAGR-interpolate
    for (let i = 0; i < anchorYears.length - 1; i++) {
        const y0 = anchorYears[i];
        const y1 = anchorYears[i + 1];
        if (year >= y0 && year <= y1) {
            const v0 = anchors[y0];
            const v1 = anchors[y1];
            const span = y1 - y0;
            const cagr = Math.pow(v1 / v0, 1 / span) - 1;
            return v0 * Math.pow(1 + cagr, year - y0);
        }
    }
    return 0;
}

/**
 * Get all states with GDP for a given year.
 * Returns array of { name, code, gdp, sharePercent, popMillions, focusSectors, cumInvestment, gdpAnchors }
 */
function getAllStateGDPs(year) {
    const nationalGDP = getIndiaGDP(year);
    return STATES_DATA.map(state => {
        const gdp = getStateGDPForYear(state, year);
        return {
            name: state.name,
            code: state.code,
            gdp: gdp,
            sharePercent: nationalGDP > 0 ? (gdp / nationalGDP) * 100 : 0,
            popMillions: state.popMillions,
            focusSectors: state.focusSectors,
            cumInvestment: state.cumInvestment,
            gdpAnchors: state.gdpAnchors
        };
    });
}

// Keep backward compatibility — alias
function getNormalizedStateGDPs(year, _nationalGDP) {
    return getAllStateGDPs(year);
}
