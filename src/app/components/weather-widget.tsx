import { Card } from './ui/card';
import { Cloud, CloudRain, CloudSnow, Sun, CloudDrizzle, Loader2 } from 'lucide-react';
import { useWeather } from '../hooks/use-weather';

export function getWeatherIcon(iconType: string, className = 'w-10 h-10') {
  switch (iconType) {
    case 'Clear':   return <Sun className={`${className} text-yellow-500`} />;
    case 'Rain':    return <CloudRain className={`${className} text-blue-500`} />;
    case 'Drizzle': return <CloudDrizzle className={`${className} text-blue-400`} />;
    case 'Snow':    return <CloudSnow className={`${className} text-blue-200`} />;
    default:        return <Cloud className={`${className} text-gray-400`} />;
  }
}

export function WeatherWidget() {
  const { weather, loading } = useWeather();

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
