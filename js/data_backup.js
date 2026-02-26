/**
 * India Trillion Dollar Economy Clock — Data Module
 * GDP in billions USD (nominal)
 *
 * Sources:
 *   - Historical (2010-2024): World Bank / IMF actual data
 *   - Projections: India_Trillion_Economy_Table_V3_Beautified.pdf (state level)
 *     and India_2047_Economic_Roadmap.pdf graph (national Viksit Bharat trajectory)
 *   - National trajectory: $4T (2024) → $45T (2047) per the Macro Assumptions (Compounding toward $45T)
 */

// ──────────────────────────────────────────────────────────
// INDIA NATIONAL GDP  (billions USD, nominal)
// Historical 2010-2024: World Bank / IMF
// Projected 2025-2047: Smooth CAGR interpolation between
//   anchor points from the Macro Assumptions graph (Compounding toward $45T)
//   Near-term: IMF WEO estimates for 2025-2026
//   Anchors: 2030→$7T, 2035→$12T, 2040→$20T, 2047→$45T
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
    // Projected — near-term: IMF; long-term roadmap anchors
    2025: 4270,
    2026: 4612,
    2027: 5085,
    2028: 5656,
    2029: 6292,
    2030: 7000,
    2031: 7800,
    2032: 8685,
    2033: 9670,
    2034: 10770,
    2035: 12000,
    2036: 13290,
    2037: 14725,
    2038: 16310,
    2039: 18070,
    2040: 20000,
    2041: 22460,
    2042: 25215,
    2043: 28310,
    2044: 31780,
    2045: 35680,
    2046: 40060,
    2047: 45000
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
// Based on our GDP projections vs IMF estimates for other major economies:
//   Japan ~$4.2T (2025), Germany ~$4.6T (2025), growing slower
//   India overtakes Japan 2025, Germany by 2027, stays #3 from 2028
//   Potentially #2 by late 2040s if trajectory holds
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
// From: India_Trillion_Economy_Table_V3_Beautified.pdf
// Anchor years with GDP in BILLIONS USD
// GDP at anchor years   →  2026 (B), 2030 (B), 2035 (B), 2040 (B), 2047 (B)
// For years before 2026: computed from state's 2026 share of national GDP
// For years between anchors: exponential (CAGR) interpolation
// ──────────────────────────────────────────────────────────
const STATES_DATA = [
    // ---- 16 major states from the PDF table ----
    {
        name: "Maharashtra", code: "MH",
        // 2024: ~$530B (historical GSDP), 2026: $556.1B, 2030: ~$1.00T, 2035: ~$1.76T, 2040: ~$3.11T, 2047: ~$6.87T
        gdpAnchors: { 2024: 530, 2026: 556.1, 2030: 1000, 2035: 1760, 2040: 3110, 2047: 6870 },
        focusSectors: "Finance, IT, media, autos, engineering, chemicals, ports/logistics",
        cumInvestment: 2.8
    },
    {
        name: "Tamil Nadu", code: "TN",
        // 2024: ~$310B, 2026: $374.3B
        gdpAnchors: { 2024: 310, 2026: 374.3, 2030: 1000, 2035: 1720, 2040: 2970, 2047: 6360 },
        focusSectors: "Autos, electronics, textiles, IT, EV hubs, export clusters, R&D",
        cumInvestment: 4.0
    },
    {
        name: "Karnataka", code: "KA",
        // 2024: ~$290B, 2026: $343.9B
        gdpAnchors: { 2024: 290, 2026: 343.9, 2030: 550, 2035: 1000, 2040: 1800, 2047: 4110 },
        focusSectors: "IT/ITES, startups, deep tech, biotech, digital exports, R&D",
        cumInvestment: 4.2
    },
    {
        name: "Gujarat", code: "GJ",
        // 2024: ~$298B, 2026: $333.6B
        gdpAnchors: { 2024: 298, 2026: 333.6, 2030: 540, 2035: 1000, 2040: 1690, 2047: 3500 },
        focusSectors: "Petrochemicals, pharma, ports, green hydrogen, export manufacturing",
        cumInvestment: 4.3
    },
    {
        name: "Uttar Pradesh", code: "UP",
        // 2024: ~$288B, 2026: $350.4B
        gdpAnchors: { 2024: 288, 2026: 350.4, 2030: 560, 2035: 1000, 2040: 1650, 2047: 3310 },
        focusSectors: "Construction, electronics, food processing, logistics, human capital",
        cumInvestment: 4.2
    },
    {
        name: "Telangana", code: "TS",
        // 2024: ~$165B, 2026: $206.5B
        gdpAnchors: { 2024: 165, 2026: 206.5, 2030: 420, 2035: 1000, 2040: 1760, 2047: 3900 },
        focusSectors: "IT/ITES, GCCs, pharma/biotech, life sciences, AI platforms",
        cumInvestment: 5.1
    },
    {
        name: "West Bengal", code: "WB",
        // 2024: ~$205B, 2026: $233.9B
        gdpAnchors: { 2024: 205, 2026: 233.9, 2030: 350, 2035: 600, 2040: 1000, 2047: 1950 },
        focusSectors: "Trade, logistics, manufacturing, port-led development, IT/BPM",
        cumInvestment: 4.9
    },
    {
        name: "Rajasthan", code: "RJ",
        // 2024: ~$175B, 2026: $210.2B
        gdpAnchors: { 2024: 175, 2026: 210.2, 2030: 330, 2035: 570, 2040: 1000, 2047: 2010 },
        focusSectors: "Mining, solar/wind, tourism, green energy, agro-processing",
        cumInvestment: 5.1
    },
    {
        name: "Andhra Pradesh", code: "AP",
        // 2024: ~$170B, 2026: $198.0B
        gdpAnchors: { 2024: 170, 2026: 198.0, 2030: 310, 2035: 560, 2040: 1000, 2047: 1950 },
        focusSectors: "Ports, aquaculture, industrialization, food/marine processing",
        cumInvestment: 5.1
    },
    {
        name: "Madhya Pradesh", code: "MP",
        // 2024: ~$155B, 2026: $187.5B
        gdpAnchors: { 2024: 155, 2026: 187.5, 2030: 300, 2035: 550, 2040: 1000, 2047: 1950 },
        focusSectors: "Agriculture, mining, logistics, food processing, mineral industries",
        cumInvestment: 5.2
    },
    {
        name: "Kerala", code: "KL",
        // 2024: ~$138B, 2026: $157.6B
        gdpAnchors: { 2024: 138, 2026: 157.6, 2030: 220, 2035: 350, 2040: 540, 2047: 1000 },
        focusSectors: "Tourism, health/education services, high-value agriculture, IT",
        cumInvestment: 5.4
    },
    {
        name: "Delhi", code: "DL",
        // 2024: ~$125B, 2026: $152.3B
        gdpAnchors: { 2024: 125, 2026: 152.3, 2030: 350, 2035: 550, 2040: 900, 2047: 1400 },
        focusSectors: "High-end services, finance, IT, digital & knowledge economy",
        cumInvestment: 5.4
    },
    {
        name: "Haryana", code: "HR",
        // 2024: ~$130B, 2026: $150.7B
        gdpAnchors: { 2024: 130, 2026: 150.7, 2030: 220, 2035: 340, 2040: 530, 2047: 1000 },
        focusSectors: "Autos, IT/BPM, NCR services, EVs, agritech, logistics",
        cumInvestment: 5.4
    },
    {
        name: "Odisha", code: "OD",
        // 2024: ~$90B, 2026: $117.4B
        gdpAnchors: { 2024: 90, 2026: 117.4, 2030: 180, 2035: 290, 2040: 490, 2047: 1000 },
        focusSectors: "Mining, metals, ports, green steel, port-based industry",
        cumInvestment: 5.6
    },
    {
        name: "Bihar", code: "BR",
        // 2024: ~$92B, 2026: $117.5B
        gdpAnchors: { 2024: 92, 2026: 117.5, 2030: 180, 2035: 290, 2040: 490, 2047: 1000 },
        focusSectors: "Basic manufacturing, infrastructure, urbanization, education/skills",
        cumInvestment: 5.6
    },
    {
        name: "Punjab", code: "PB",
        // 2024: ~$88B, 2026: $102.4B
        gdpAnchors: { 2024: 88, 2026: 102.4, 2030: 160, 2035: 270, 2040: 470, 2047: 1000 },
        focusSectors: "Agriculture, food processing, high-value crops, SMEs, renewables",
        cumInvestment: 5.7
    },

    // ---- States NOT in the PDF — estimated proportionally ----
    {
        name: "Jharkhand", code: "JH",
        gdpAnchors: { 2024: 68, 2026: 85, 2030: 130, 2035: 220, 2040: 380, 2047: 700 },
        focusSectors: "Mining, steel, heavy industry, minerals",
        cumInvestment: null
    },
    {
        name: "Chhattisgarh", code: "CG",
        gdpAnchors: { 2024: 58, 2026: 70, 2030: 110, 2035: 190, 2040: 330, 2047: 600 },
        focusSectors: "Mining, steel, power, agriculture",
        cumInvestment: null
    },
    {
        name: "Assam", code: "AS",
        gdpAnchors: { 2024: 52, 2026: 65, 2030: 100, 2035: 165, 2040: 280, 2047: 520 },
        focusSectors: "Tea, oil & gas, tourism, agro-industries",
        cumInvestment: null
    },
    {
        name: "Uttarakhand", code: "UK",
        gdpAnchors: { 2024: 44, 2026: 55, 2030: 85, 2035: 145, 2040: 250, 2047: 470 },
        focusSectors: "Tourism, pharma, IT, renewable energy",
        cumInvestment: null
    },
    {
        name: "Himachal Pradesh", code: "HP",
        gdpAnchors: { 2024: 27, 2026: 32, 2030: 50, 2035: 85, 2040: 145, 2047: 270 },
        focusSectors: "Tourism, hydro power, horticulture",
        cumInvestment: null
    },
    {
        name: "Jammu & Kashmir", code: "JK",
        gdpAnchors: { 2024: 25, 2026: 30, 2030: 47, 2035: 80, 2040: 135, 2047: 250 },
        focusSectors: "Tourism, handicrafts, horticulture, IT",
        cumInvestment: null
    },
    {
        name: "Goa", code: "GA",
        gdpAnchors: { 2024: 17, 2026: 21, 2030: 33, 2035: 55, 2040: 95, 2047: 175 },
        focusSectors: "Tourism, IT, pharma, mining",
        cumInvestment: null
    },
    {
        name: "Other States & UTs", code: "UT",
        // Aggregates: NE states (Sikkim, Arunachal, Meghalaya, Manipur, Mizoram,
        //   Nagaland, Tripura), Ladakh, A&N, Lakshadweep, Puducherry, Chandigarh, D&NH&DD
        gdpAnchors: { 2024: 80, 2026: 100, 2030: 155, 2035: 260, 2040: 440, 2047: 820 },
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

/** State GDP growth rate (YoY %) — uses actual CAGR between anchors */
function getStateGrowthRate(state, year) {
    const gdpNow = getStateGDPForYear(state, year);
    const gdpPrev = getStateGDPForYear(state, year - 1);
    if (!gdpPrev || gdpPrev <= 0) return 0;
    return ((gdpNow - gdpPrev) / gdpPrev) * 100;
}

// ──────────────────────────────────────────────────────────
// State GDP computation
// ──────────────────────────────────────────────────────────

/**
 * Get state GDP (billions) for ANY year by:
 *   1) For years between anchor points → exponential (CAGR) interpolation
 *   2) For years before the first anchor (2026) → use the 2026 share of national GDP
 */
function getStateGDPForYear(state, year) {
    const anchors = state.gdpAnchors;
    const anchorYears = Object.keys(anchors).map(Number).sort((a, b) => a - b);
    const firstAnchorYear = anchorYears[0];
    const lastAnchorYear = anchorYears[anchorYears.length - 1];

    if (year <= firstAnchorYear) {
        // Before first anchor: use the state's share of national GDP at 2026
        const share2026 = anchors[firstAnchorYear] / INDIA_GDP[firstAnchorYear];
        return share2026 * getIndiaGDP(year);
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
 * Returns array of { name, code, gdp (billions), sharePercent, focusSectors, cumInvestment }
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
