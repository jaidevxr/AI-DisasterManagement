import React, { useState, useEffect } from 'react';
import { Sun, Moon, MapPin, Cloud, CloudRain, CloudSnow, Wind } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Location } from '@/types';
import { useNavigate } from 'react-router-dom';

interface DynamicIslandProps {
  userLocation: Location | null;
}

interface WeatherData {
  temperature: number;
  weatherCode: number;
  description: string;
  isDay: number;
}

const DynamicIsland: React.FC<DynamicIslandProps> = ({ userLocation }) => {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [cityName, setCityName] = useState<string>('Detecting...');
  const [isExpanded, setIsExpanded] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    console.log('🏝️ Dynamic Island - userLocation:', userLocation);
    if (userLocation) {
      // Reverse geocoding to get city name
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${userLocation.lat}&lon=${userLocation.lng}`)
        .then(res => res.json())
        .then(data => {
          const city = data.address?.city || 
                       data.address?.county || 
                       data.address?.state_district || 
                       data.address?.town || 
                       data.address?.village || 
                       data.address?.state || 
                       'Unknown Location';
          setCityName(city);
          console.log('📍 City detected:', city);
        })
        .catch((err) => {
          console.error('Failed to get city name:', err);
          setCityName('Location detected');
        });

      // Fetch real-time weather from OpenWeather API via Supabase Edge Function
      fetch('https://ziqqqkzxakejqdixevng.supabase.co/functions/v1/weather', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppcXFxa3p4YWtlanFkaXhldm5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4Mzk3OTIsImV4cCI6MjA3MzQxNTc5Mn0.PGoeqEUwOgG0gA2lpknAwTsJivKeOeP_Mcc0w6rkA_A'
        },
        body: JSON.stringify({ lat: userLocation.lat, lng: userLocation.lng })
      })
        .then(res => res.json())
        .then(data => {
          if (data.current) {
            const condition = data.current.condition;
            const weatherCode = getWeatherCodeFromCondition(condition);
            setWeather({
              temperature: data.current.temperature,
              weatherCode,
              description: data.current.description,
              isDay: data.current.isDay
            });
            console.log('🌤️ Real-time OpenWeather:', { 
              temp: data.current.temperature,
              condition,
              isDay: data.current.isDay,
              time: new Date().toLocaleString()
            });
          }
        })
        .catch((err) => {
          console.error('Failed to fetch weather:', err);
        });
    }
  }, [userLocation]);

  const getWeatherCodeFromCondition = (condition: string): number => {
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes('clear')) return 0;
    if (conditionLower.includes('cloud')) return 2;
    if (conditionLower.includes('mist') || conditionLower.includes('fog') || conditionLower.includes('haze')) return 45;
    if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) return 61;
    if (conditionLower.includes('snow')) return 71;
    if (conditionLower.includes('thunder')) return 95;
    return 0;
  };

  const getWeatherIcon = (code: number, isDay: number) => {
    // Clear sky - show sun for day, moon for night
    if (code === 0) {
      return isDay === 1 
        ? <Sun className="h-4 w-4 text-amber-400" /> 
        : <Moon className="h-4 w-4 text-blue-300" />;
    }
    // Partly cloudy - show cloud
    if (code <= 3) {
      return <Cloud className="h-4 w-4 text-foreground" />;
    }
    // Fog/Mist
    if (code <= 48) return <Cloud className="h-4 w-4 text-muted-foreground" />;
    // Rainy
    if (code <= 67) return <CloudRain className="h-4 w-4 text-blue-400" />;
    // Snowy
    if (code <= 77) return <CloudSnow className="h-4 w-4 text-blue-200" />;
    // Windy/stormy
    return <Wind className="h-4 w-4 text-foreground" />;
  };

  const toggleTheme = () => setIsDark(!isDark);

  const handleWeatherClick = () => {
    navigate('/?tab=weather');
    // Trigger tab change event
    window.dispatchEvent(new CustomEvent('changeTab', { detail: 'weather' }));
  };

  return (
    <div 
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[1001]"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div 
        className={`
          glass-strong border border-border/30 rounded-full 
          transition-all duration-300 ease-in-out
          will-change-[padding]
          shadow-lg backdrop-blur-xl
          ${isExpanded ? 'px-6 py-3' : 'px-4 py-2.5'}
        `}
      >
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="h-8 w-8 p-0 rounded-full hover:bg-accent/20 transition-colors duration-200"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-slate-700" />
            )}
          </Button>

          {/* Divider */}
          <div 
            className={`
              h-6 w-px bg-border/30 
              transition-opacity duration-300 ease-in-out
              ${isExpanded ? 'opacity-100' : 'opacity-0'}
            `}
          />

          {/* Location Info - Clickable to go to weather */}
          <div 
            onClick={handleWeatherClick}
            className={`
              flex items-center gap-3 text-sm overflow-hidden whitespace-nowrap
              transition-all duration-300 ease-in-out
              will-change-[max-width,opacity]
              cursor-pointer hover:opacity-80
              ${isExpanded ? 'max-w-[600px] opacity-100' : 'max-w-0 opacity-0'}
            `}
          >
            <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="font-medium text-foreground truncate">
                {cityName}
              </span>
              {userLocation && cityName !== 'Detecting...' && (
                <span className="text-xs text-muted-foreground truncate">
                  {userLocation.lat.toFixed(4)}°, {userLocation.lng.toFixed(4)}°
                </span>
              )}
            </div>

            {/* Weather Info */}
            {weather && cityName !== 'Detecting...' && (
              <>
                <div className="h-6 w-px bg-border/30" />
                <div className="flex items-center gap-1.5">
                  {getWeatherIcon(weather.weatherCode, weather.isDay)}
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground">{weather.temperature}°C</span>
                    <span className="text-xs text-muted-foreground">{weather.description}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Compact Location Indicator - Clickable */}
          <div 
            onClick={handleWeatherClick}
            className={`
              flex items-center gap-1.5 whitespace-nowrap
              transition-all duration-300 ease-in-out
              will-change-[max-width,opacity]
              cursor-pointer hover:opacity-80
              ${isExpanded ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100'}
            `}
          >
            <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="text-sm font-medium text-foreground truncate">
              {cityName}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicIsland;
