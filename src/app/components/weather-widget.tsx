import { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { Cloud, CloudRain, CloudSnow, Sun, CloudDrizzle, Loader2 } from 'lucide-react';

interface WeatherData {
  temp: number;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    try {
      setLoading(true);
      const latitude = 39.1653; // Bloomington, IN (IU campus)
      const longitude = -86.5264;
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph&forecast_days=1`
      );
      if (!res.ok) throw new Error('Weather fetch failed');
      const data = await res.json();
      const current = data.current;
      const { description, icon } = getWeatherInfo(current.weather_code);
      setWeather({
        temp: Math.round(current.temperature_2m),
        description,
        humidity: current.relative_humidity_2m,
        windSpeed: Math.round(current.wind_speed_10m),
        icon,
      });
    } catch {
      setWeather({ temp: 78, description: 'partly cloudy', humidity: 65, windSpeed: 8, icon: 'Clouds' });
    } finally {
      setLoading(false);
    }
  };

  const getWeatherInfo = (code: number): { description: string; icon: string } => {
    if (code === 0) return { description: 'clear sky', icon: 'Clear' };
    if (code <= 3) return { description: 'partly cloudy', icon: 'Clouds' };
    if (code <= 49) return { description: 'foggy', icon: 'Clouds' };
    if (code <= 59) return { description: 'drizzle', icon: 'Drizzle' };
    if (code <= 69) return { description: 'rain', icon: 'Rain' };
    if (code <= 79) return { description: 'snow', icon: 'Snow' };
    if (code <= 84) return { description: 'rain showers', icon: 'Rain' };
    return { description: 'cloudy', icon: 'Clouds' };
  };

  const getWeatherIcon = (iconType: string) => {
    switch (iconType) {
      case 'Clear': return <Sun className="w-10 h-10 text-yellow-500" />;
      case 'Rain': return <CloudRain className="w-10 h-10 text-blue-500" />;
      case 'Drizzle': return <CloudDrizzle className="w-10 h-10 text-blue-400" />;
      case 'Snow': return <CloudSnow className="w-10 h-10 text-blue-200" />;
      default: return <Cloud className="w-10 h-10 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 text-primary animate-spin" />
          <span className="text-sm text-muted-foreground">Loading weather...</span>
        </div>
      </Card>
    );
  }

  if (!weather) return null;

  return (
    <Card className="p-4">
      <div className="flex flex-col items-center text-center gap-3">
        {getWeatherIcon(weather.icon)}
        <div>
          <div className="text-3xl font-semibold">{weather.temp}°F</div>
          <p className="text-sm text-muted-foreground capitalize mt-1">{weather.description}</p>
          <p className="text-xs text-muted-foreground mt-1">Bloomington, IN</p>
        </div>
      </div>
    </Card>
  );
}
