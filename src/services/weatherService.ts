export interface DailyForecast {
  date: string; // e.g. "Today", "Thu", "Fri"
  dayName: string; // e.g. "Mon", "Tue"
  tempMaxC: number;
  tempMinC: number;
  tempMaxF: number;
  tempMinF: number;
  condition: string; // e.g. "Sunny", "Partly Cloudy", "Light Rain"
  weatherCode: number;
  icon: 'sun' | 'cloud-sun' | 'cloud' | 'rain' | 'thunder' | 'snow';
  precipitationProb: number; // e.g. 15%
}

export interface LocationWeather {
  locationName: string;
  cityName: string;
  country: string;
  currentTempC: number;
  currentTempF: number;
  currentCondition: string;
  forecast: DailyForecast[];
}

const weatherCache = new Map<string, LocationWeather>();

// Helper WMO Weather Code interpreter
function interpretWmoCode(code: number): { condition: string; icon: DailyForecast['icon'] } {
  if (code === 0) return { condition: 'Clear Sky', icon: 'sun' };
  if (code === 1 || code === 2) return { condition: 'Partly Cloudy', icon: 'cloud-sun' };
  if (code === 3) return { condition: 'Overcast', icon: 'cloud' };
  if (code >= 45 && code <= 48) return { condition: 'Foggy', icon: 'cloud' };
  if (code >= 51 && code <= 67) return { condition: 'Rain Showers', icon: 'rain' };
  if (code >= 71 && code <= 77) return { condition: 'Snowfall', icon: 'snow' };
  if (code >= 80 && code <= 82) return { condition: 'Heavy Rain', icon: 'rain' };
  if (code >= 85 && code <= 86) return { condition: 'Snow Showers', icon: 'snow' };
  if (code >= 95) return { condition: 'Thunderstorm', icon: 'thunder' };
  return { condition: 'Pleasant', icon: 'sun' };
}

// Fallback deterministic weather generator if API call is throttled/offline
function generateFallbackWeather(location: string): LocationWeather {
  const hash = Array.from(location).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const baseTemp = 18 + (hash % 12); // Between 18C and 30C
  const dayNames = ['Today', 'Tomorrow', 'Day 3'];
  const conditions: { condition: string; icon: DailyForecast['icon'] }[] = [
    { condition: 'Sunny & Clear', icon: 'sun' },
    { condition: 'Partly Cloudy', icon: 'cloud-sun' },
    { condition: 'Mild Breezes', icon: 'cloud-sun' },
    { condition: 'Light Sunshine', icon: 'sun' },
  ];

  const forecast: DailyForecast[] = dayNames.map((day, idx) => {
    const tempMaxC = baseTemp + (idx % 2 === 0 ? 2 : -1);
    const tempMinC = tempMaxC - 6;
    const condObj = conditions[(hash + idx) % conditions.length];
    return {
      date: day,
      dayName: idx === 0 ? 'Today' : idx === 1 ? 'Tomorrow' : 'Day +2',
      tempMaxC,
      tempMinC,
      tempMaxF: Math.round((tempMaxC * 9) / 5 + 32),
      tempMinF: Math.round((tempMinC * 9) / 5 + 32),
      condition: condObj.condition,
      weatherCode: 0,
      icon: condObj.icon,
      precipitationProb: (hash * (idx + 1)) % 25,
    };
  });

  return {
    locationName: location,
    cityName: location.split(',')[0].trim(),
    country: location.split(',')[1]?.trim() || '',
    currentTempC: forecast[0].tempMaxC,
    currentTempF: forecast[0].tempMaxF,
    currentCondition: forecast[0].condition,
    forecast,
  };
}

export async function fetch3DayWeather(locationString: string): Promise<LocationWeather> {
  const cleanLocation = locationString.trim();
  if (weatherCache.has(cleanLocation)) {
    return weatherCache.get(cleanLocation)!;
  }

  // Extract city name (e.g. "Amalfi" from "Amalfi Coast, Italy")
  const cityName = cleanLocation.split(',')[0].replace(/(Coast|Bay|Beach|Islands|Valley|Region|City)/gi, '').trim() || cleanLocation.split(',')[0].trim();

  try {
    // 1. Geocode location using Open-Meteo Geocoding API
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;
    const geoRes = await fetch(geoUrl);
    if (!geoRes.ok) throw new Error('Geocoding failed');
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      const fallback = generateFallbackWeather(locationString);
      weatherCache.set(cleanLocation, fallback);
      return fallback;
    }

    const { latitude, longitude, name, country } = geoData.results[0];

    // 2. Fetch 3-day forecast from Open-Meteo
    const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=3`;
    const forecastRes = await fetch(forecastUrl);
    if (!forecastRes.ok) throw new Error('Forecast fetch failed');
    const forecastData = await forecastRes.json();

    const daily = forecastData.daily;
    if (!daily || !daily.time || daily.time.length < 3) {
      const fallback = generateFallbackWeather(locationString);
      weatherCache.set(cleanLocation, fallback);
      return fallback;
    }

    const forecastList: DailyForecast[] = [];
    for (let i = 0; i < 3; i++) {
      const dateObj = new Date(daily.time[i]);
      const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dateObj.toLocaleDateString('en-US', { weekday: 'short' });
      const maxC = Math.round(daily.temperature_2m_max[i]);
      const minC = Math.round(daily.temperature_2m_min[i]);
      const wCode = daily.weathercode[i];
      const { condition, icon } = interpretWmoCode(wCode);
      const precip = daily.precipitation_probability_max ? daily.precipitation_probability_max[i] : 0;

      forecastList.push({
        date: daily.time[i],
        dayName,
        tempMaxC: maxC,
        tempMinC: minC,
        tempMaxF: Math.round((maxC * 9) / 5 + 32),
        tempMinF: Math.round((minC * 9) / 5 + 32),
        condition,
        weatherCode: wCode,
        icon,
        precipitationProb: precip,
      });
    }

    const result: LocationWeather = {
      locationName: locationString,
      cityName: name || cityName,
      country: country || '',
      currentTempC: forecastList[0].tempMaxC,
      currentTempF: forecastList[0].tempMaxF,
      currentCondition: forecastList[0].condition,
      forecast: forecastList,
    };

    weatherCache.set(cleanLocation, result);
    return result;
  } catch (err) {
    console.warn(`[WeatherService] Error fetching weather for "${locationString}", using fallback:`, err);
    const fallback = generateFallbackWeather(locationString);
    weatherCache.set(cleanLocation, fallback);
    return fallback;
  }
}
