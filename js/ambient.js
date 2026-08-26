// ========================================
// AMBIENT DATA — Weather & Lunar Engine + NASA APOD
// Open-Meteo (no key) · Astronomical Lunar Calc · NASA APOD (DEMO_KEY)
// ========================================

// WMO weather interpretation codes → label
const WMO_CONDITIONS = {
    0: 'Clear sky',
    1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
    45: 'Fog', 48: 'Icy fog',
    51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle',
    61: 'Light rain', 63: 'Rain', 65: 'Heavy rain',
    71: 'Light snow', 73: 'Snow', 75: 'Heavy snow', 77: 'Snow grains',
    80: 'Light showers', 81: 'Rain showers', 82: 'Violent showers',
    85: 'Snow showers', 86: 'Heavy snow showers',
    95: 'Thunderstorm', 96: 'Thunderstorm with hail', 99: 'Severe thunderstorm'
};

// Day vs Night WMO icons
const WMO_ICONS_DAY = {
    0: '☼', 1: '🌤', 2: '⛅', 3: '☁',
    45: '🌫', 48: '🌫',
    51: '🌦', 53: '🌦', 55: '🌧',
    61: '🌧', 63: '🌧', 65: '🌧',
    71: '❄', 73: '❄', 75: '❄', 77: '❄',
    80: '🌦', 81: '🌦', 82: '⛈',
    85: '❄', 86: '❄',
    95: '⛈', 96: '⛈', 99: '⛈'
};

const WMO_ICONS_NIGHT = {
    0: '☾', 1: '☾', 2: '☁', 3: '☁',
    45: '🌫', 48: '🌫',
    51: '🌧', 53: '🌧', 55: '🌧',
    61: '🌧', 63: '🌧', 65: '🌧',
    71: '❄', 73: '❄', 75: '❄', 77: '❄',
    80: '🌧', 81: '🌧', 82: '⛈',
    85: '❄', 86: '❄',
    95: '⛈', 96: '⛈', 99: '⛈'
};

const WEATHER_CONFIG = {
    cacheKey: 'weather_cache_v2',
    unitKey: 'weather_temp_unit',
    cacheTTL: 30 * 60 * 1000 // 30 minutes
};

// Replace DEMO_KEY with your free key from api.nasa.gov
const APOD_CONFIG = {
    apiKey: 'DEMO_KEY',
    cacheKey: 'apod_cache'
};

// ─── Astronomical Lunar Engine ─────────────────────────────────────────────

/**
 * Calculate Lunar Phase & Illumination
 * Standard astronomical synodic algorithm (period ~29.53058867 days)
 */
function getLunarPhase(date = new Date()) {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate() + (date.getUTCHours() + date.getUTCMinutes() / 60) / 24;

    let y = year;
    let m = month;
    if (m <= 2) {
        y -= 1;
        m += 12;
    }
    const a = Math.floor(y / 100);
    const b = 2 - a + Math.floor(a / 4);
    const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5;

    // Reference new moon: Jan 6, 2000, 18:14 UTC (JD 2451549.26)
    const synodicMonth = 29.53058867;
    const daysSinceNewMoon = (jd - 2451549.26) % synodicMonth;
    const age = daysSinceNewMoon < 0 ? daysSinceNewMoon + synodicMonth : daysSinceNewMoon;
    const phaseFraction = age / synodicMonth;
    const illumination = Math.round((1 - Math.cos(2 * Math.PI * phaseFraction)) / 2 * 100);

    const PHASES = [
        { name: 'New Moon', icon: '🌑', min: 0, max: 0.033 },
        { name: 'Waxing Crescent', icon: '🌒', min: 0.033, max: 0.216 },
        { name: 'First Quarter', icon: '🌓', min: 0.216, max: 0.283 },
        { name: 'Waxing Gibbous', icon: '🌔', min: 0.283, max: 0.466 },
        { name: 'Full Moon', icon: '🌕', min: 0.466, max: 0.533 },
        { name: 'Waning Gibbous', icon: '🌖', min: 0.533, max: 0.716 },
        { name: 'Last Quarter', icon: '🌗', min: 0.716, max: 0.783 },
        { name: 'Waning Crescent', icon: '🌘', min: 0.783, max: 0.966 },
        { name: 'New Moon', icon: '🌑', min: 0.966, max: 1.0 }
    ];

    const currentPhase = PHASES.find(p => phaseFraction >= p.min && phaseFraction < p.max) || PHASES[0];

    return {
        name: currentPhase.name,
        icon: currentPhase.icon,
        illumination: illumination,
        age: Math.round(age * 10) / 10,
        fraction: phaseFraction
    };
}

// ─── Weather & Telemetry Engine ───────────────────────────────────────────

let currentWeatherState = null;

function getPreferredUnit() {
    return localStorage.getItem(WEATHER_CONFIG.unitKey) || 'C';
}

function setPreferredUnit(unit) {
    localStorage.setItem(WEATHER_CONFIG.unitKey, unit);
}

function formatTemperature(celsius, unit) {
    if (unit === 'F') {
        const fahrenheit = Math.round(celsius * 9 / 5 + 32);
        return `${fahrenheit}°F`;
    }
    return `${Math.round(celsius)}°C`;
}

// 1. Silent browser geolocation (only if already granted, no prompt)
// 2. IP geolocation via ipwho.is (no key, no rate limit)
// 3. Hardcoded Bengaluru fallback
async function resolveLocation() {
    if (navigator.geolocation && navigator.permissions) {
        try {
            const perm = await navigator.permissions.query({ name: 'geolocation' });
            if (perm.state === 'granted') {
                const pos = await new Promise((resolve, reject) =>
                    navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 4000 })
                );
                const { latitude: lat, longitude: lon } = pos.coords;
                const geoRes = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10`
                );
                const geoData = await geoRes.json();
                const city = geoData.address?.city
                    || geoData.address?.town
                    || geoData.address?.village
                    || geoData.address?.state_district
                    || 'Your location';
                return { lat, lon, city };
            }
        } catch (_) {}
    }

    try {
        const res = await fetch('https://ipwho.is/');
        const d = await res.json();
        if (d.success && d.latitude) {
            return { lat: d.latitude, lon: d.longitude, city: d.city || 'Unknown' };
        }
    } catch (_) {}

    return { lat: 12.9716, lon: 77.5946, city: 'Bengaluru' };
}

async function fetchWeather() {
    try {
        const cached = JSON.parse(localStorage.getItem(WEATHER_CONFIG.cacheKey));
        if (cached && Date.now() - cached.ts < WEATHER_CONFIG.cacheTTL) return cached.data;
    } catch (_) {}

    const loc = await resolveLocation();

    // Show city immediately while temp/condition loads
    const cityEl = document.getElementById('weather-city');
    if (cityEl) cityEl.textContent = loc.city;

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&temperature_unit=celsius&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Weather API ${res.status}`);
    const raw = await res.json();

    const data = {
        temp: raw.current.temperature_2m,
        apparentTemp: raw.current.apparent_temperature,
        humidity: raw.current.relative_humidity_2m,
        windSpeed: Math.round(raw.current.wind_speed_10m),
        isDay: raw.current.is_day === 1,
        code: raw.current.weather_code,
        city: loc.city
    };

    localStorage.setItem(WEATHER_CONFIG.cacheKey, JSON.stringify({ data, ts: Date.now() }));
    return data;
}

function renderWeather(data) {
    currentWeatherState = data;
    const unit = getPreferredUnit();

    const tempEl = document.getElementById('weather-temp');
    const condEl = document.getElementById('weather-condition');
    const cityEl = document.getElementById('weather-city');
    const lunarEl = document.getElementById('weather-lunar');
    const apparentEl = document.getElementById('weather-apparent');
    const humidityEl = document.getElementById('weather-humidity');
    const windEl = document.getElementById('weather-wind');
    const lunarAgeEl = document.getElementById('weather-lunar-age');

    if (cityEl) cityEl.textContent = data.city;
    if (tempEl) tempEl.textContent = formatTemperature(data.temp, unit);

    const iconsMap = data.isDay ? WMO_ICONS_DAY : WMO_ICONS_NIGHT;
    const icon = iconsMap[data.code] ?? (data.isDay ? '☼' : '☾');
    const conditionText = WMO_CONDITIONS[data.code] ?? 'Atmospheric';
    if (condEl) {
        condEl.textContent = `${icon} ${conditionText}`;
        condEl.title = `Sky: ${conditionText} · Feels like: ${formatTemperature(data.apparentTemp, unit)} · Humidity: ${data.humidity}% · Wind: ${data.windSpeed} km/h`;
    }

    // Render Lunar Phase
    const lunar = getLunarPhase();
    if (lunarEl) {
        lunarEl.textContent = `${lunar.icon} ${lunar.illumination}%`;
        lunarEl.title = `Moon: ${lunar.name} (${lunar.illumination}% illuminated · Day ${lunar.age}/29.5)`;
    }

    // Render Cockpit Panel Stats
    if (apparentEl) apparentEl.textContent = formatTemperature(data.apparentTemp, unit);
    if (humidityEl) humidityEl.textContent = `${data.humidity}%`;
    if (windEl) windEl.textContent = `${data.windSpeed} km/h`;
    if (lunarAgeEl) lunarAgeEl.textContent = `${lunar.name} (Day ${lunar.age} / 29.5)`;
}

function initWeatherInteractions() {
    const tempBtn = document.getElementById('weather-temp-btn');
    const expandBtn = document.getElementById('hudExpandBtn');
    const hudPanel = document.getElementById('hudPanel');

    if (tempBtn) {
        tempBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const currentUnit = getPreferredUnit();
            const nextUnit = currentUnit === 'C' ? 'F' : 'C';
            setPreferredUnit(nextUnit);
            if (currentWeatherState) {
                renderWeather(currentWeatherState);
            }
        });
    }

    if (expandBtn && hudPanel) {
        expandBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isOpen = hudPanel.classList.toggle('open');
            expandBtn.classList.toggle('active', isOpen);
            expandBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            const hud = document.getElementById('ambientHud');
            if (hud && !hud.contains(e.target) && hudPanel.classList.contains('open')) {
                hudPanel.classList.remove('open');
                expandBtn.classList.remove('active');
                expandBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }
}

async function initWeather() {
    initWeatherInteractions();
    try {
        const data = await fetchWeather();
        renderWeather(data);
        logger.log('✅ Ambient Cockpit HUD loaded');
    } catch (err) {
        logger.error('❌ Weather failed:', err);
        // Even if network weather fails, lunar engine calculation works offline
        const lunar = getLunarPhase();
        const lunarEl = document.getElementById('weather-lunar');
        if (lunarEl) {
            lunarEl.textContent = `${lunar.icon} ${lunar.illumination}%`;
            lunarEl.title = `Moon: ${lunar.name} (${lunar.illumination}% illuminated)`;
        }
    }
}

// ─── NASA APOD ────────────────────────────────────────────────────────────

async function fetchAPOD() {
    try {
        const cached = JSON.parse(localStorage.getItem(APOD_CONFIG.cacheKey));
        const today = new Date().toISOString().split('T')[0];
        if (cached?.data?.date === today) return cached.data;
    } catch (_) {}

    const res = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${APOD_CONFIG.apiKey}`);
    if (!res.ok) throw new Error(`NASA APOD ${res.status}`);
    const data = await res.json();

    localStorage.setItem(APOD_CONFIG.cacheKey, JSON.stringify({ data }));
    return data;
}

function renderAPOD(data) {
    const container = document.getElementById('apod-container');
    if (!container) return;

    const isVideo = data.media_type === 'video';
    const mediaHTML = isVideo
        ? `<div class="apod-video-wrapper">
               <iframe src="${data.url}" frameborder="0" allowfullscreen title="${data.title}"></iframe>
           </div>`
        : `<img src="${data.url}" alt="${data.title}" loading="lazy">`;

    // Cap explanation at ~380 chars to keep the card balanced
    const blurb = data.explanation.length > 380
        ? data.explanation.slice(0, 377) + '…'
        : data.explanation;

    const credit = data.copyright
        ? `<p class="apod-credit">© ${data.copyright.trim().replace(/\n/g, ' ')}</p>`
        : '';

    container.innerHTML = `
        <div class="apod-media">${mediaHTML}</div>
        <div class="apod-info">
            <p class="apod-date">${data.date}</p>
            <h3 class="apod-title">${data.title}</h3>
            <p class="apod-explanation">${blurb}</p>
            ${credit}
        </div>
    `;

    logger.log('✅ NASA APOD loaded:', data.title);
}

async function initAPOD() {
    const container = document.getElementById('apod-container');
    if (!container) return; // Only execute on pages with APOD container (homepage)

    try {
        const data = await fetchAPOD();
        renderAPOD(data);
    } catch (err) {
        logger.error('❌ NASA APOD failed:', err);
        document.getElementById('apod-section')?.style.setProperty('display', 'none');
    }
}

// ─── Boot ─────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    initWeather();
    initAPOD();
});
