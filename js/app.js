/**
 * GFST Indian Trillion Economy Clock — Main Application
 * Realistic ticking clock with digit-flip animation,
 * interactive SVG map, light/dark theme, timeline/live modes.
 */
(function () {
    'use strict';

    // ── State ──
    let selectedYear = Math.max(2010, Math.min(2047, new Date().getFullYear()));
    let currentGDP = 0;           // billions
    let gdpPerSecond = 0;         // billions / real-second
    let isLiveYear = false;       // true only if selectedYear == real current year
    let tickInterval = null;
    let sortMode = 'gdp';
    let mode = 'live';            // 'live' | 'timeline'
    let stateEls = {};
    let selectedStateCode = null;
    let mapPaths = {};
    let cachedStates = [];
    let prevDigitStr = '';
    let usdInrRate = 83.5;        // default fallback rate
    let lastDisplayUpdate = 0;    // throttle display to 1 Hz
    let livePopulation = 0;       // live population estimate
    let popPerSecond = 0;         // population growth per second

    // ── DOM refs ──
    const $ = id => document.getElementById(id);
    const $clockDigits   = $('clockDigits');
    const $clockHuman    = $('clockHuman');
    const $yearChip      = $('yearChip');
    const $pulseText     = $('pulseText');
    const $growthRate    = $('growthRate');
    const $globalRank    = $('globalRank');
    const $perCapita     = $('perCapita');
    const $population    = $('population');
    const $metricYear    = $('metricYear');
    const $cardsGrid     = $('cardsGrid');
    const $timelineRow   = $('timelineRow');
    const $sliderRow     = $('sliderRow');
    const $sliderYear    = $('sliderYear');
    const $yearSlider    = $('yearSlider');
    const $sliderLabels  = $('sliderLabels');
    const $mapContainer  = $('mapContainer');
    const $mapTip        = $('mapTip');
    const $tipName       = $('tipName');
    const $tipGDP        = $('tipGDP');
    const $tipShare      = $('tipShare');
    const $mapLegend     = $('mapLegend');
    const $mpName        = $('mpName');
    const $mpCode        = $('mpCode');
    const $mpGDP         = $('mpGDP');
    const $mpShare       = $('mpShare');
    const $mpGrowth      = $('mpGrowth');
    const $mpPerCap      = $('mpPerCap');
    const $mpTrillion    = $('mpTrillion');
    const $indPerCap     = $('indPerCap');
    const $indPop        = $('indPop');
    const $indTrillionSt = $('indTrillionStates');
    const $indTarget     = $('indTarget');
    const $fxRate        = $('fxRate');

    // ── Map Projection ──
    const MAP_BOUNDS = { minLon: 68, maxLon: 98, minLat: 6, maxLat: 38 };
    const MAP_W = 560, MAP_H = 640;
    const projX = lon => ((lon - MAP_BOUNDS.minLon) / (MAP_BOUNDS.maxLon - MAP_BOUNDS.minLon)) * MAP_W;
    const projY = lat => ((MAP_BOUNDS.maxLat - lat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * MAP_H;

    // ══════════════════════════════════════
    //  INIT
    // ══════════════════════════════════════
    function init() {
        setupBackground();
        setupThemeToggle();
        setupModeToggle();
        buildTimeline();
        buildSlider();
        setupSortButtons();
        renderMap();
        buildLegend();
        fetchExchangeRate();
        initLivePopulation();
        setYear(selectedYear);
        startClock();
    }

    // ══════════════════════════════════════
    //  LIVE POPULATION (worldometers-style)
    // ══════════════════════════════════════
    function initLivePopulation() {
        // Use UN WPP data: interpolate between year-start and year-end population
        // India adds ~11-12M people/year in mid-2020s
        const now = new Date();
        const ry = now.getFullYear();
        const popStart = getPopulation(ry - 1);  // end of previous year = start of this year
        const popEnd = getPopulation(ry);        // end of current year
        const yearMs = new Date(ry + 1, 0, 1) - new Date(ry, 0, 1);
        const elapsed = now - new Date(ry, 0, 1);
        const frac = elapsed / yearMs;

        // Live pop in millions
        livePopulation = popStart + (popEnd - popStart) * frac;
        // Growth per second in millions
        popPerSecond = (popEnd - popStart) / (365.25 * 86400);
    }

    // ══════════════════════════════════════
    //  EXCHANGE RATE (live USD/INR)
    // ══════════════════════════════════════
    function fetchExchangeRate() {
        fetch('https://open.er-api.com/v6/latest/USD')
            .then(r => r.json())
            .then(data => {
                if (data && data.rates && data.rates.INR) {
                    usdInrRate = data.rates.INR;
                    updateFxDisplay();
                }
            })
            .catch(() => { /* use fallback rate */ });
        // Refresh every 30 minutes
        setInterval(() => {
            fetch('https://open.er-api.com/v6/latest/USD')
                .then(r => r.json())
                .then(data => {
                    if (data && data.rates && data.rates.INR) {
                        usdInrRate = data.rates.INR;
                        updateFxDisplay();
                    }
                })
                .catch(() => {});
        }, 30 * 60 * 1000);
    }

    function updateFxDisplay() {
        if ($fxRate) $fxRate.textContent = '₹' + usdInrRate.toFixed(2);
    }

    // ══════════════════════════════════════
    //  THEME TOGGLE
    // ══════════════════════════════════════
    function setupThemeToggle() {
        const btn = $('themeToggle');
        // Restore saved theme
        const saved = localStorage.getItem('theme');
        if (saved) document.documentElement.setAttribute('data-theme', saved);

        btn.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('theme', next);
        });
    }

    // ══════════════════════════════════════
    //  MODE TOGGLE (LIVE / TIMELINE)
    // ══════════════════════════════════════
    function setupModeToggle() {
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                mode = btn.dataset.mode;

                if (mode === 'live') {
                    $timelineRow.classList.remove('hidden');
                    $sliderRow.classList.add('hidden');
                    setYear(new Date().getFullYear());
                } else {
                    $timelineRow.classList.add('hidden');
                    $sliderRow.classList.remove('hidden');
                    setYear(parseInt($yearSlider.value));
                }
            });
        });
    }

    // ══════════════════════════════════════
    //  TIMELINE DOTS (LIVE mode)
    // ══════════════════════════════════════
    function buildTimeline() {
        const years = [2010, 2014, 2019, 2024, 2026, 2030, 2035, 2040, 2047];
        const currentReal = new Date().getFullYear();

        $timelineRow.innerHTML = '';
        years.forEach(y => {
            const dot = document.createElement('button');
            dot.className = 'tl-dot' + (y === selectedYear ? ' active' : '') + (y < currentReal ? ' past' : '');
            dot.textContent = y;
            dot.addEventListener('click', () => setYear(y));
            $timelineRow.appendChild(dot);
        });
    }

    // ══════════════════════════════════════
    //  SLIDER (TIMELINE mode)
    // ══════════════════════════════════════
    function buildSlider() {
        $yearSlider.addEventListener('input', e => {
            const y = parseInt(e.target.value);
            $sliderYear.textContent = y;
            setYear(y);
        });
        const labels = [2010, 2015, 2020, 2025, 2030, 2035, 2040, 2047];
        labels.forEach(y => {
            const sp = document.createElement('span');
            sp.textContent = y;
            $sliderLabels.appendChild(sp);
        });
    }

    // ══════════════════════════════════════
    //  SORT BUTTONS
    // ══════════════════════════════════════
    function setupSortButtons() {
        document.querySelectorAll('.sort-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                sortMode = btn.dataset.sort;
                renderCards();
            });
        });
    }

    // ══════════════════════════════════════
    //  SET YEAR
    // ══════════════════════════════════════
    function setYear(year) {
        selectedYear = Math.max(2010, Math.min(2047, year));

        $yearChip.textContent = selectedYear;
        $sliderYear.textContent = selectedYear;
        $yearSlider.value = selectedYear;
        $metricYear.textContent = selectedYear;

        // Update timeline dot highlight
        document.querySelectorAll('.tl-dot').forEach(d => {
            d.classList.toggle('active', parseInt(d.textContent) === selectedYear);
        });

        // Compute GDP position within the year
        // GDP table values represent year-end annual GDP
        // Live year interpolates from previous year-end to current year-end
        const now = new Date();
        const ry = now.getFullYear();
        isLiveYear = (selectedYear === ry);

        if (isLiveYear) {
            // Current year: interpolate from end-of-previous-year to end-of-this-year
            const gdpPrev = getIndiaGDP(selectedYear - 1);
            const gdpCurr = getIndiaGDP(selectedYear);
            const s = new Date(ry, 0, 1), e = new Date(ry + 1, 0, 1);
            const frac = (now - s) / (e - s);
            const yearGrowth = gdpCurr - gdpPrev;
            currentGDP = gdpPrev + yearGrowth * frac;
            gdpPerSecond = yearGrowth / (365.25 * 86400);
            // Reinit live population for this year
            initLivePopulation();
        } else {
            // Past or future year: show the year's GDP figure, no ticking
            currentGDP = getIndiaGDP(selectedYear);
            gdpPerSecond = 0;
            livePopulation = getPopulation(selectedYear);
            popPerSecond = 0;
        }

        updateAll();
        renderCards();
        updateMapColors();
        if (selectedStateCode) updatePanel(selectedStateCode);
    }

    // ══════════════════════════════════════
    //  CLOCK TICK (1 Hz — updates once per second)
    // ══════════════════════════════════════
    function startClock() {
        if (tickInterval) cancelAnimationFrame(tickInterval);
        let last = performance.now();

        function tick(ts) {
            const dt = (ts - last) / 1000;
            last = ts;
            if (isLiveYear && gdpPerSecond !== 0) {
                currentGDP += gdpPerSecond * dt;
                livePopulation += popPerSecond * dt;
                // Throttle display to once per second for calm digit movement
                if (ts - lastDisplayUpdate >= 1000) {
                    lastDisplayUpdate = ts;
                    updateClockDisplay();
                    updateHuman();
                    updateCardTicks();
                    updateLiveMetrics();
                }
            }
            tickInterval = requestAnimationFrame(tick);
        }
        tickInterval = requestAnimationFrame(tick);
    }

    // ══════════════════════════════════════
    //  DISPLAY UPDATES
    // ══════════════════════════════════════
    function updateAll() {
        updateClockDisplay();
        updateHuman();
        updatePulse();
        updateMetrics();
        updateIndicators();
    }

    function updateClockDisplay() {
        const dollars = Math.floor(currentGDP * 1e9);
        const str = dollars.toLocaleString('en-US');

        // Build digit cells
        if (str.length !== prevDigitStr.length) {
            // Rebuild DOM structure
            $clockDigits.innerHTML = '';
            for (let i = 0; i < str.length; i++) {
                const span = document.createElement('span');
                span.className = str[i] === ',' ? 'digit-cell sep' : 'digit-cell';
                span.textContent = str[i];
                $clockDigits.appendChild(span);
            }
        } else {
            // Update only changed digits with animation
            const cells = $clockDigits.children;
            for (let i = 0; i < str.length; i++) {
                if (str[i] !== prevDigitStr[i]) {
                    cells[i].textContent = str[i];
                    cells[i].classList.remove('digit-changed');
                    // Force reflow for re-trigger
                    void cells[i].offsetWidth;
                    cells[i].classList.add('digit-changed');
                }
            }
        }
        prevDigitStr = str;
    }

    function updateHuman() {
        const t = currentGDP / 1000;
        const inrT = (currentGDP * usdInrRate) / 1000;
        if (t >= 1) {
            $clockHuman.textContent = '≈ $' + t.toFixed(2) + ' Trillion (₹' + inrT.toFixed(0) + 'T)';
        } else {
            $clockHuman.textContent = '≈ $' + currentGDP.toFixed(0) + ' Billion (₹' + (currentGDP * usdInrRate).toFixed(0) + 'B)';
        }
    }

    function updatePulse() {
        if (!isLiveYear) {
            // No ticking for past/future years
            const pulseRing = document.querySelector('.pulse-ring');
            if (pulseRing) pulseRing.style.display = 'none';
            if (selectedYear < new Date().getFullYear()) {
                $pulseText.textContent = 'Historical data (year-end)';
            } else {
                $pulseText.textContent = 'Projected data (start-of-year)';
            }
            $pulseText.style.color = 'var(--text-3)';
            return;
        }
        const pulseRing = document.querySelector('.pulse-ring');
        if (pulseRing) pulseRing.style.display = '';
        $pulseText.style.color = '';
        // Show per-day which is more intuitive
        const perDay = gdpPerSecond * 86400 * 1e9;
        const perDayINR = perDay * usdInrRate;
        $pulseText.textContent = '+$' + formatCompact(perDay) + ' / ₹' + formatCompact(perDayINR) + ' per day';
    }

    function updateMetrics() {
        const growth = getGrowthRate(selectedYear);
        $growthRate.textContent = growth.toFixed(1) + '%';

        const rank = getRank(selectedYear);
        $globalRank.textContent = '#' + rank;

        // Use live population for current year, static for others
        const pop = isLiveYear ? livePopulation : getPopulation(selectedYear);
        const pc = (currentGDP * 1e9) / (pop * 1e6);

        if (isLiveYear) {
            $perCapita.textContent = '$' + pc.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            // Compact ticking format for metric bar: "1,449.2M" 
            $population.textContent = pop.toFixed(1).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + 'M';
        } else {
            $perCapita.textContent = '$' + formatCompact(pc);
            $population.textContent = (pop / 1000).toFixed(2) + 'B';
        }

        // Update FX rate display
        if ($fxRate) $fxRate.textContent = '₹' + usdInrRate.toFixed(2);
    }

    function updateIndicators() {
        const pop = isLiveYear ? livePopulation : getPopulation(selectedYear);
        const pc = (currentGDP * 1e9) / (pop * 1e6);

        if (isLiveYear) {
            $indPerCap.textContent = '$' + pc.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            // Full ticking headcount for indicator card
            const headcount = Math.floor(pop * 1e6);
            $indPop.textContent = headcount.toLocaleString('en-IN');
        } else {
            $indPerCap.textContent = '$' + formatCompact(pc);
            $indPop.textContent = (pop / 1000).toFixed(2) + 'B';
        }

        const states = getAllStateGDPs(selectedYear);
        $indTrillionSt.textContent = states.filter(s => s.gdp >= 1000).length;
        $indTarget.textContent = '$' + (INDIA_GDP[2047] / 1000).toFixed(0) + 'T';
    }

    // Live-update only the ticking metrics (per capita + population) every second
    function updateLiveMetrics() {
        if (!isLiveYear) return;
        const pc = (currentGDP * 1e9) / (livePopulation * 1e6);
        // Metric bar: compact
        $perCapita.textContent = '$' + pc.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        $population.textContent = livePopulation.toFixed(1).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + 'M';
        // Indicator cards: full headcount
        $indPerCap.textContent = '$' + pc.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        const headcount = Math.floor(livePopulation * 1e6);
        $indPop.textContent = headcount.toLocaleString('en-IN');
    }

    // ══════════════════════════════════════
    //  SVG MAP
    // ══════════════════════════════════════
    function renderMap() {
        if (typeof INDIA_MAP_DATA === 'undefined') return;
        const ns = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(ns, 'svg');
        svg.setAttribute('viewBox', `0 0 ${MAP_W} ${MAP_H}`);
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        svg.setAttribute('class', 'india-map-svg');

        const CODE_MAP = {
            AN:'UT',AR:'UT',CH:'UT',DN:'UT',DD:'UT',
            LD:'UT',MN:'UT',ML:'UT',MZ:'UT',NL:'UT',
            PY:'UT',SK:'UT',TR:'UT',LA:'UT'
        };

        INDIA_MAP_DATA.forEach(f => {
            const dc = f.d || CODE_MAP[f.c] || f.c;
            const paths = geoToPaths(f.g);
            if (!paths) return;

            const g = document.createElementNS(ns, 'g');
            g.setAttribute('class', 'map-state');
            g.dataset.code = f.c;
            g.dataset.dataCode = dc;
            g.dataset.name = f.n;

            paths.forEach(d => {
                const p = document.createElementNS(ns, 'path');
                p.setAttribute('d', d);
                p.setAttribute('class', 'state-path');
                g.appendChild(p);
            });

            if (f.ct) {
                const lbl = document.createElementNS(ns, 'text');
                lbl.setAttribute('x', projX(f.ct[0]));
                lbl.setAttribute('y', projY(f.ct[1]));
                lbl.setAttribute('class', 'state-label');
                lbl.setAttribute('text-anchor', 'middle');
                lbl.setAttribute('dominant-baseline', 'central');
                lbl.textContent = f.c;
                g.appendChild(lbl);
            }

            g.addEventListener('mouseenter', e => onHover(f, dc, e));
            g.addEventListener('mousemove', e => moveTip(e));
            g.addEventListener('mouseleave', () => onLeave());
            g.addEventListener('click', () => onClick(f, dc));

            svg.appendChild(g);
            if (!mapPaths[dc]) mapPaths[dc] = [];
            mapPaths[dc].push(g);
        });

        $mapContainer.innerHTML = '';
        $mapContainer.appendChild(svg);
    }

    function geoToPaths(geo) {
        if (!geo) return null;
        const out = [];
        if (geo.type === 'Polygon') out.push(ringToD(geo.coordinates[0]));
        else if (geo.type === 'MultiPolygon') geo.coordinates.forEach(p => out.push(ringToD(p[0])));
        return out.filter(Boolean);
    }
    function ringToD(ring) {
        if (!ring || ring.length < 3) return null;
        return ring.map((c, i) => (i ? 'L' : 'M') + projX(c[0]).toFixed(1) + ',' + projY(c[1]).toFixed(1)).join('') + 'Z';
    }

    // Clean 4-tier choropleth: gray → blue → dark-blue → gold
    // Intuitive at a glance: darker = bigger economy, gold = trillion club
    function gdpColor(b) {
        if (b >= 1000) return '#f59e0b'; // gold — trillion dollar economy
        if (b >= 300)  return '#1d4ed8'; // dark blue — large economy
        if (b >= 100)  return '#3b82f6'; // blue — medium economy
        return '#94a3b8';               // gray — emerging / small
    }

    function updateMapColors() {
        if (typeof INDIA_MAP_DATA === 'undefined') return;
        cachedStates = getAllStateGDPs(selectedYear);
        const m = {};
        cachedStates.forEach(s => m[s.code] = s);

        INDIA_MAP_DATA.forEach(f => {
            const dc = f.d || f.c;
            const sd = m[dc];
            const color = gdpColor(sd ? sd.gdp : 0);
            (mapPaths[dc] || []).forEach(g => g.querySelectorAll('.state-path').forEach(p => p.style.fill = color));
        });
    }

    function buildLegend() {
        const r = [
            {l:'$1T+',c:'#f59e0b'},
            {l:'$300B+',c:'#1d4ed8'},
            {l:'$100B+',c:'#3b82f6'},
            {l:'<$100B',c:'#94a3b8'}
        ];
        $mapLegend.innerHTML = r.map(x =>
            `<div class="legend-item"><span class="legend-swatch" style="background:${x.c}"></span>${x.l}</div>`
        ).join('');
    }

    // Map interactions
    function onHover(f, dc, evt) {
        const sd = cachedStates.find(s => s.code === dc);
        if (!sd) return;
        $tipName.textContent = f.n;
        $tipGDP.textContent = '$' + fmtB(sd.gdp);
        $tipShare.textContent = sd.sharePercent.toFixed(1) + '% of GDP';
        $mapTip.classList.add('visible');
        moveTip(evt);
        document.querySelectorAll('.map-state').forEach(g => g.classList.remove('hovered'));
        (mapPaths[dc] || []).forEach(g => g.classList.add('hovered'));
    }
    function moveTip(evt) {
        const r = $mapContainer.getBoundingClientRect();
        let x = evt.clientX - r.left + 16, y = evt.clientY - r.top - 10;
        if (x + 200 > r.width) x = evt.clientX - r.left - 200;
        if (y < 0) y = 10;
        $mapTip.style.left = x + 'px';
        $mapTip.style.top = y + 'px';
    }
    function onLeave() {
        $mapTip.classList.remove('visible');
        document.querySelectorAll('.map-state').forEach(g => g.classList.remove('hovered'));
    }
    function onClick(f, dc) {
        selectedStateCode = dc;
        document.querySelectorAll('.map-state').forEach(g => g.classList.remove('selected'));
        (mapPaths[dc] || []).forEach(g => g.classList.add('selected'));
        updatePanel(dc);
    }

    function updatePanel(code) {
        const sd = cachedStates.find(s => s.code === code);
        if (!sd) return;
        const si = STATES_DATA.find(s => s.code === code);
        $mpName.textContent = sd.name;
        $mpCode.textContent = sd.code;
        $mpGDP.textContent = '$' + fmtB(sd.gdp);
        $mpShare.textContent = sd.sharePercent.toFixed(1) + '%';

        const gdpNow = getStateGDPForYear(si, selectedYear);
        const gdpPrev = getStateGDPForYear(si, selectedYear - 1);
        const gr = gdpPrev > 0 ? ((gdpNow - gdpPrev) / gdpPrev) * 100 : 0;
        $mpGrowth.textContent = gr.toFixed(1) + '%';

        // Use actual state population (popMillions scaled with national growth)
        const si2 = STATES_DATA.find(s => s.code === code);
        const sPopM = si2 ? getStatePopulation(si2, selectedYear) : 0;
        $mpPerCap.textContent = sPopM > 0 ? '$' + formatCompact((sd.gdp * 1e9) / (sPopM * 1e6)) : '—';

        if (sd.gdp >= 1000) {
            $mpTrillion.textContent = '✅ Crossed $1T';
            $mpTrillion.style.color = 'var(--accent)';
        } else {
            const anc = si.gdpAnchors;
            const yrs = Object.keys(anc).map(Number).sort((a,b)=>a-b);
            let cy = '—';
            for (const y of yrs) if (anc[y] >= 1000) { cy = y; break; }
            $mpTrillion.textContent = cy !== '—' ? `Target: ${cy}` : 'Post 2047';
            $mpTrillion.style.color = 'var(--gold)';
        }
    }

    // ══════════════════════════════════════
    //  STATE CARDS
    // ══════════════════════════════════════
    function renderCards() {
        let states = getAllStateGDPs(selectedYear);
        cachedStates = states;
        const maxGDP = Math.max(...states.map(s => s.gdp));

        if (sortMode === 'gdp') states.sort((a, b) => b.gdp - a.gdp);
        else if (sortMode === 'growth') {
            states.sort((a, b) => {
                const ga = (a.gdpAnchors || {})[2047] / ((a.gdpAnchors || {})[2026] || 1);
                const gb = (b.gdpAnchors || {})[2047] / ((b.gdpAnchors || {})[2026] || 1);
                return gb - ga;
            });
        } else states.sort((a, b) => a.name.localeCompare(b.name));

        $cardsGrid.innerHTML = '';
        stateEls = {};

        states.forEach((s, i) => {
            const si = STATES_DATA.find(x => x.code === s.code);
            const gdpNow = si ? getStateGDPForYear(si, selectedYear) : 0;
            const gdpPrev = si ? getStateGDPForYear(si, selectedYear - 1) : 0;
            const gr = gdpPrev > 0 ? ((gdpNow - gdpPrev) / gdpPrev) * 100 : 0;
            const barW = (s.gdp / maxGDP * 100).toFixed(1);

            const color = gdpColor(s.gdp);
            const card = document.createElement('div');
            card.className = 'state-card' + (s.gdp >= 1000 ? ' trillion-card' : '');
            card.style.animationDelay = (i * 0.025) + 's';
            card.style.setProperty('--card-color', color);
            card.innerHTML = `
                <div class="sc-header">
                    <span class="sc-rank">${i + 1}</span>
                    <span class="sc-name">${s.name}</span>
                    <span class="sc-share">${s.sharePercent.toFixed(1)}%</span>
                </div>
                <div class="sc-gdp" data-code="${s.code}" style="color:${color}">$${fmtB(s.gdp)}</div>
                <div class="sc-bar-wrap"><div class="sc-bar" style="width:${barW}%;background:${color}"></div></div>
                <div class="sc-meta">
                    <span>Share: ${s.sharePercent.toFixed(1)}%</span>
                    <span class="sc-growth">▲ ${gr.toFixed(1)}%</span>
                </div>`;
            card.addEventListener('click', () => {
                selectedStateCode = s.code;
                onClick({ n: s.name, c: s.code }, s.code);
                document.querySelector('.map-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
            $cardsGrid.appendChild(card);
            stateEls[s.code] = card.querySelector(`[data-code="${s.code}"]`);
        });
    }

    function updateCardTicks() {
        // State cards always show the year-end target GDP (matching Excel projections).
        // Only the national GDP clock ticks live within the year.
        for (const code in stateEls) {
            const el = stateEls[code];
            if (!el) continue;
            const si = STATES_DATA.find(s => s.code === code);
            if (!si) continue;
            const stateGDP = getStateGDPForYear(si, selectedYear);
            el.textContent = '$' + fmtB(stateGDP);
        }
    }

    // ══════════════════════════════════════
    //  FORMATTING
    // ══════════════════════════════════════
    function fmtB(b) {
        if (b >= 1000) return (b / 1000).toFixed(3) + 'T';
        if (b >= 100) return b.toFixed(1) + 'B';
        if (b >= 10) return b.toFixed(2) + 'B';
        return b.toFixed(3) + 'B';
    }
    function formatCompact(v) {
        if (v >= 1e12) return (v / 1e12).toFixed(2) + 'T';
        if (v >= 1e9) return (v / 1e9).toFixed(2) + 'B';
        if (v >= 1e6) return (v / 1e6).toFixed(2) + 'M';
        if (v >= 1e3) return (v / 1e3).toFixed(1) + 'K';
        return Math.round(v).toLocaleString();
    }

    // ══════════════════════════════════════
    //  ANIMATED BACKGROUND
    // ══════════════════════════════════════
    function setupBackground() {
        const canvas = $('bgCanvas');
        const ctx = canvas.getContext('2d');
        let pts = [], w, h;

        function resize() {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
            pts = [];
            const n = Math.min(70, Math.floor(w * h / 22000));
            for (let i = 0; i < n; i++) {
                pts.push({
                    x: Math.random() * w, y: Math.random() * h,
                    vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25,
                    r: Math.random() * 1.2 + .4, a: Math.random() * .25 + .08
                });
            }
        }

        function draw() {
            ctx.clearRect(0, 0, w, h);
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            const color = isDark ? '0,229,160' : '5,150,105';
            pts.forEach(p => {
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
                if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${color},${p.a})`;
                ctx.fill();
            });
            for (let i = 0; i < pts.length; i++) {
                for (let j = i + 1; j < pts.length; j++) {
                    const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
                    const d = Math.sqrt(dx * dx + dy * dy);
                    if (d < 130) {
                        ctx.beginPath();
                        ctx.moveTo(pts[i].x, pts[i].y);
                        ctx.lineTo(pts[j].x, pts[j].y);
                        ctx.strokeStyle = `rgba(${color},${.04 * (1 - d / 130)})`;
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(draw);
        }

        resize();
        draw();
        window.addEventListener('resize', resize);
    }

    // ══════════════════════════════════════
    //  START
    // ══════════════════════════════════════
    document.addEventListener('DOMContentLoaded', init);
})();
