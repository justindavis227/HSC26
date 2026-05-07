import { useEffect, useState } from 'react';

export interface WeatherData {
  temp: number;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

function getWeatherInfo(code: number): { description: string; icon: string } {
  if (code === 0) return { description: 'clear sky', icon: 'Clear' };
  if (code <= 3) return { description: 'partly cloudy', icon: 'Clouds' };
  if (code <= 49) return { description: 'foggy', icon: 'Clouds' };
  if (code <= 59) return { description: 'drizzle', icon: 'Drizzle' };
  if (code <= 69) return { description: 'rain', icon: 'Rain' };
  if (code <= 79) return { description: 'snow', icon: 'Snow' };
  if (code <= 84) return { description: 'rain showers', icon: 'Rain' };
  return { description: 'cloudy', icon: 'Clouds' };
}

// Module-level cache so multiple useWeather() calls share one fetch
let cachedWeather: WeatherData | null = null;
let fetchPromise: Promise<WeatherData | null> | null = null;

async function fetchWeather(): Promise<WeatherData | null> {
  try {
    const res = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=39.1653&longitude=-86.5264&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph&forecast_days=1'
    );
    if (!res.ok) throw new Error('failed');
    const data = await res.json();
    const current = data.current;
    const { description, icon } = getWeatherInfo(current.weather_code);
    return {
      temp: Math.round(current.temperature_2m),
      description,
      humidity: current.relative_humidity_2m,
      windSpeed: Math.round(current.wind_speed_10m),
      icon,
    };
  } catch {
    return { temp: 78, description: 'partly cloudy', humidity: 65, windSpeed: 8, icon: 'Clouds' };
  }
}

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(cachedWeather);
  const [loading, setLoading] = useState(cachedWeather === null);

  useEffect(() => {
    if (cachedWeather) { setWeather(cachedWeather); setLoading(false); return; }
    if (!fetchPromise) fetchPromise = fetchWeather();
    fetchPromise.then(data => {
      cachedWeather = data;
      setWeather(data);
      setLoading(false);
    });
  }, []);

  return { weather, loading };
}
