// ========================================
// AMBIENT DATA — Weather + NASA APOD
// Open-Meteo (no key) · NASA APOD (DEMO_KEY)
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

const WMO_ICONS = {
    0: '☀', 1: '🌤', 2: '⛅', 3: '☁',
    45: '🌫', 48: '🌫',
    51: '🌦', 53: '🌦', 55: '🌧',
    61: '🌧', 63: '🌧', 65: '🌧',
    71: '❄', 73: '❄', 75: '❄', 77: '❄',
    80: '🌦', 81: '🌦', 82: '⛈',
    85: '❄', 86: '❄',
    95: '⛈', 96: '⛈', 99: '⛈'
};

const WEATHER_CONFIG = {
    cacheKey: 'weather_cache',
    cacheTTL: 60 * 60 * 1000
};

// Replace DEMO_KEY with your free key from api.nasa.gov
const APOD_CONFIG = {
    apiKey: 'DEMO_KEY',
    cacheKey: 'apod_cache'
};

// ─── Weather ──────────────────────────────────────────────────────────────

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

    // Show city immediately while temp/condition still loads
    const cityEl = document.getElementById('weather-city');
    if (cityEl) cityEl.textContent = loc.city;

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current=temperature_2m,weather_code&temperature_unit=celsius&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Weather API ${res.status}`);
    const raw = await res.json();

    const data = {
        temp: Math.round(raw.current.temperature_2m),
        code: raw.current.weather_code,
        city: loc.city // stored so cache hits can also render the city
    };
    localStorage.setItem(WEATHER_CONFIG.cacheKey, JSON.stringify({ data, ts: Date.now() }));
    return data;
}

function renderWeather(data) {
    const tempEl = document.getElementById('weather-temp');
    const condEl = document.getElementById('weather-condition');
    const cityEl = document.getElementById('weather-city');
    if (!tempEl || !condEl) return;

    if (cityEl) cityEl.textContent = data.city;
    tempEl.textContent = `${data.temp}°C`;
    condEl.textContent = `${WMO_ICONS[data.code] ?? '◌'} ${WMO_CONDITIONS[data.code] ?? 'Unknown'}`;
}

async function initWeather() {
    try {
        const data = await fetchWeather();
        renderWeather(data);
        logger.log('✅ Weather loaded');
    } catch (err) {
        logger.error('❌ Weather failed:', err);
        document.getElementById('weather-strip')?.style.setProperty('display', 'none');
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
