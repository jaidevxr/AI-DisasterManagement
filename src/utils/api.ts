import axios from 'axios';
import { DisasterEvent, WeatherData, EmergencyFacility, Location } from '@/types';
import { supabase } from '@/integrations/supabase/client';

const USGS_EARTHQUAKE_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_day.geojson';
const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';
const NOMINATIM_API_URL = 'https://nominatim.openstreetmap.org/search';

// Get user's current location
export const getCurrentLocation = (): Promise<Location> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("✅ Current location detected:", position.coords.latitude, position.coords.longitude);
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.error("❌ Geolocation error:", error.code, error.message);
        reject(error);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  });
};

// Check if coordinates are within India's boundaries (more precise)
const isInIndia = (lat: number, lng: number): boolean => {
  // More precise boundaries to exclude Nepal, Pakistan, Bangladesh, Myanmar, etc.
  // India mainland: roughly 8°N to 35°N latitude, 68°E to 97°E longitude
  // Excluding border regions more strictly
  
  // Exclude Nepal (north of ~27.5°N and east of 80°E)
  if (lat > 27.5 && lng > 80 && lng < 88.2 && lat < 30.5) return false;
  
  // Exclude Pakistan (west of 74°E for northern regions)
  if (lng < 74 && lat > 30) return false;
  
  // Exclude Bangladesh (east of 89°E and north of 22°N)
  if (lng > 88.5 && lat > 22 && lat < 26.5 && lng < 92.5) return false;
  
  // Exclude Myanmar (east of 94°E)
  if (lng > 94) return false;
  
  // Exclude Sri Lanka (south of 10°N)
  if (lat < 8.5 && lng > 79 && lng < 82) return false;
  
  // Main India boundaries (more conservative)
  return lat >= 8 && lat <= 35.5 && lng >= 68.5 && lng <= 97.5;
};

// Get Indian state from coordinates
const getIndianState = (lat: number, lng: number, placeName: string = ''): string => {
  // Check place name first for accurate state detection
  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 
    'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 
    'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 
    'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir', 
    'Ladakh', 'Puducherry', 'Chandigarh', 'Andaman and Nicobar', 'Lakshadweep'
  ];
  
  // Try to match state from place name
  for (const state of indianStates) {
    if (placeName.toLowerCase().includes(state.toLowerCase())) {
      return state;
    }
  }
  
  // Rough state boundaries based on coordinates
  if (lat >= 32 && lat <= 36.5 && lng >= 74 && lng <= 80) return 'Jammu and Kashmir';
  if (lat >= 30.5 && lat <= 33 && lng >= 75 && lng <= 77) return 'Himachal Pradesh';
  if (lat >= 28.5 && lat <= 31.5 && lng >= 77 && lng <= 81) return 'Uttarakhand';
  if (lat >= 30 && lat <= 32.5 && lng >= 74 && lng <= 76.5) return 'Punjab';
  if (lat >= 28 && lat <= 31 && lng >= 74.5 && lng <= 77.5) return 'Haryana';
  if (lat >= 28.4 && lat <= 28.9 && lng >= 76.8 && lng <= 77.4) return 'Delhi';
  if (lat >= 24 && lat <= 30.5 && lng >= 68 && lng <= 78) return 'Rajasthan';
  if (lat >= 23.5 && lat <= 30.5 && lng >= 78 && lng <= 84.5) return 'Uttar Pradesh';
  if (lat >= 21.5 && lat <= 27 && lng >= 82 && lng <= 88.5) return 'Bihar';
  if (lat >= 24 && lat <= 27.5 && lng >= 85 && lng <= 88) return 'Jharkhand';
  if (lat >= 21.5 && lat <= 27.5 && lng >= 88 && lng <= 92.5) return 'West Bengal';
  if (lat >= 21 && lat <= 26.5 && lng >= 69 && lng <= 74.5) return 'Gujarat';
  if (lat >= 21.5 && lat <= 27 && lng >= 73.5 && lng <= 82) return 'Madhya Pradesh';
  if (lat >= 15.5 && lat <= 23 && lng >= 73 && lng <= 80.5) return 'Maharashtra';
  if (lat >= 17 && lat <= 22.5 && lng >= 80.5 && lng <= 84.5) return 'Chhattisgarh';
  if (lat >= 17.5 && lat <= 22.5 && lng >= 81.5 && lng <= 87.5) return 'Odisha';
  if (lat >= 13 && lat <= 19.5 && lng >= 76 && lng <= 81) return 'Telangana';
  if (lat >= 12.5 && lat <= 19.5 && lng >= 77 && lng <= 85) return 'Andhra Pradesh';
  if (lat >= 11.5 && lat <= 18.5 && lng >= 74 && lng <= 78.5) return 'Karnataka';
  if (lat >= 14.5 && lat <= 20 && lng >= 72.5 && lng <= 78.5) return 'Goa';
  if (lat >= 8 && lat <= 13 && lng >= 74.5 && lng <= 77.5) return 'Kerala';
  if (lat >= 8 && lat <= 13.5 && lng >= 76.5 && lng <= 80.5) return 'Tamil Nadu';
  if (lat >= 23.5 && lat <= 28.5 && lng >= 89.5 && lng <= 94) return 'Assam';
  if (lat >= 23 && lat <= 28 && lng >= 90.5 && lng <= 93.5) return 'Meghalaya';
  if (lat >= 22 && lat <= 24.5 && lng >= 91 && lng <= 93) return 'Tripura';
  if (lat >= 23 && lat <= 27.5 && lng >= 92 && lng <= 94.5) return 'Mizoram';
  if (lat >= 24.5 && lat <= 27.5 && lng >= 93 && lng <= 95.5) return 'Manipur';
  if (lat >= 25 && lat <= 27.5 && lng >= 93.5 && lng <= 95.5) return 'Nagaland';
  if (lat >= 27 && lat <= 29.5 && lng >= 88 && lng <= 89.5) return 'Sikkim';
  if (lat >= 26.5 && lat <= 29.5 && lng >= 91.5 && lng <= 97.5) return 'Arunachal Pradesh';
  if (lat >= 6 && lat <= 14 && lng >= 92 && lng <= 94) return 'Andaman and Nicobar';
  
  return 'India';
};

// Fetch comprehensive disaster data from multiple sources for India
export const fetchDisasterData = async (): Promise<DisasterEvent[]> => {
  const allDisasters: DisasterEvent[] = [];

  try {
    // 1. Fetch earthquakes from USGS (last 30 days, magnitude 2.5+)
    const earthquakeUrl = 'https://earthquake.usgs.gov/fdsnws/event/1/query';
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    
    const earthquakeParams = new URLSearchParams({
      format: 'geojson',
      starttime: thirtyDaysAgo,
      endtime: today,
      minmagnitude: '2.5',
      minlatitude: '8',
      maxlatitude: '35.5',
      minlongitude: '68.5',
      maxlongitude: '97.5',
      orderby: 'time-asc'
    });

    const earthquakeResponse = await axios.get(`${earthquakeUrl}?${earthquakeParams}`);
    const earthquakes = earthquakeResponse.data.features || [];

    earthquakes.forEach((feature: any) => {
      const coords = feature.geometry.coordinates;
      const props = feature.properties;
      const lat = coords[1];
      const lng = coords[0];
      
      // Strict India boundary check
      if (!isInIndia(lat, lng)) return;
      
      // Filter out events with Nepal, Pakistan, Bangladesh, Myanmar, China in the name
      const place = (props.place || '').toLowerCase();
      if (place.includes('nepal') || place.includes('pakistan') || 
          place.includes('bangladesh') || place.includes('myanmar') || 
          place.includes('china') || place.includes('bhutan') ||
          place.includes('tibet') || place.includes('sri lanka')) {
        return;
      }
      
      let severity: 'low' | 'medium' | 'high' = 'low';
      if (props.mag >= 6.0) severity = 'high';
      else if (props.mag >= 4.5) severity = 'medium';

      const stateName = getIndianState(lat, lng, props.place || '');

      allDisasters.push({
        id: feature.id,
        type: 'earthquake',
        severity,
        magnitude: props.mag,
        location: { 
          lat,
          lng,
          name: stateName
        },
        time: new Date(props.time).toISOString(),
        title: `Magnitude ${props.mag} Earthquake - ${stateName}`,
        description: `Detected in ${stateName}, India - Depth: ${coords[2]?.toFixed(1) || 'N/A'} km`,
        url: props.url,
      });
    });

    console.log(`Fetched ${allDisasters.length} earthquakes from USGS (India only)`);

  } catch (error) {
    console.error('Error fetching earthquake data:', error);
  }

  try {
    // 2. Fetch from GDACS (all disaster types)
    const gdacsUrl = 'https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH';
    const gdacsResponse = await axios.get(gdacsUrl, {
      params: {
        fromDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        toDate: new Date().toISOString().split('T')[0],
        alertlevel: 'Orange;Red',
      }
    });

    const gdacsEvents = gdacsResponse.data.features || [];
    
    gdacsEvents.forEach((event: any) => {
      const coords = event.geometry?.coordinates;
      if (!coords) return;
      
      const lng = coords[0];
      const lat = coords[1];
      
      // Strict India boundary check
      if (!isInIndia(lat, lng)) return;
      
      // Only include if country is India
      const props = event.properties;
      const country = (props.country || '').toLowerCase();
      if (country && country !== 'india') return;
      
      let disasterType: 'earthquake' | 'flood' | 'cyclone' | 'fire' | 'landslide' = 'earthquake';
      const eventType = (props.eventtype || '').toLowerCase();
      
      if (eventType.includes('fl')) disasterType = 'flood';
      else if (eventType.includes('tc') || eventType.includes('storm')) disasterType = 'cyclone';
      else if (eventType.includes('vo')) disasterType = 'fire';
      else if (eventType.includes('dr')) disasterType = 'landslide';

      let severity: 'low' | 'medium' | 'high' = 'medium';
      const alertLevel = (props.alertlevel || '').toLowerCase();
      if (alertLevel.includes('red')) severity = 'high';
      else if (alertLevel.includes('orange')) severity = 'medium';

      const stateName = getIndianState(lat, lng, props.name || '');

      allDisasters.push({
        id: `gdacs-${props.eventid || Math.random()}`,
        type: disasterType,
        severity,
        magnitude: props.severity?.value,
        location: { 
          lat, 
          lng,
          name: stateName
        },
        time: props.fromdate || new Date().toISOString(),
        title: `${props.name || disasterType} - ${stateName}`,
        description: props.htmldescription || props.description || `GDACS ${severity} alert in ${stateName}`,
        url: `https://www.gdacs.org/report.aspx?eventid=${props.eventid}&eventtype=${props.eventtype}`,
      });
    });

    const indiaGdacsCount = gdacsEvents.filter((e: any) => {
      const c = e.geometry?.coordinates;
      return c && isInIndia(c[1], c[0]);
    }).length;
    console.log(`Fetched ${indiaGdacsCount} GDACS events for India`);

  } catch (error) {
    console.error('Error fetching GDACS data:', error);
  }

  // Remove duplicates based on coordinates and time (within 1 hour)
  const uniqueDisasters = allDisasters.filter((disaster, index, self) => {
    return index === self.findIndex((d) => {
      const timeDiff = Math.abs(new Date(d.time).getTime() - new Date(disaster.time).getTime());
      const coordMatch = Math.abs(d.location.lat - disaster.location.lat) < 0.1 && 
                         Math.abs(d.location.lng - disaster.location.lng) < 0.1;
      return coordMatch && timeDiff < 3600000; // 1 hour
    });
  });

  // Sort by time (most recent first)
  uniqueDisasters.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  console.log(`Total unique disasters: ${uniqueDisasters.length}`);
  return uniqueDisasters;
};

// Note: Disaster predictions removed - only showing real data from USGS and GDACS APIs

// Legacy function for backward compatibility
export const fetchEarthquakeData = fetchDisasterData;

// Fetch weather data for multiple locations (for heatmap overlay)
export const fetchWeatherDataForMultipleLocations = async (
  locations: Location[]
): Promise<Map<string, { temp: number; rainfall: number }>> => {
  const weatherMap = new Map<string, { temp: number; rainfall: number }>();
  
  // Batch requests to avoid overwhelming the API
  const batchSize = 10;
  for (let i = 0; i < locations.length; i += batchSize) {
    const batch = locations.slice(i, i + batchSize);
    
    const promises = batch.map(async (location) => {
      try {
        const params = new URLSearchParams({
          latitude: location.lat.toString(),
          longitude: location.lng.toString(),
          current: 'temperature_2m,precipitation',
          timezone: 'auto',
        });

        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?${params}`
        );
        
        if (!response.ok) return null;
        
        const data = await response.json();
        const key = `${location.lat.toFixed(2)},${location.lng.toFixed(2)}`;
        
        return {
          key,
          data: {
            temp: data.current?.temperature_2m || 0,
            rainfall: data.current?.precipitation || 0,
          }
        };
      } catch (error) {
        console.error('Error fetching weather for location:', location, error);
        return null;
      }
    });

    const results = await Promise.all(promises);
    results.forEach(result => {
      if (result) {
        weatherMap.set(result.key, result.data);
      }
    });
    
    // Small delay between batches to be respectful to the API
    if (i + batchSize < locations.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return weatherMap;
};

// Fetch weather data using OpenWeather API via edge function
export const fetchWeatherData = async (location: Location): Promise<WeatherData | null> => {
  try {
    console.log('Fetching real weather data from OpenWeather API...');
    
    // Call the Supabase edge function
    const { data, error } = await supabase.functions.invoke('weather', {
      body: { lat: location.lat, lng: location.lng }
    });

    if (error) {
      console.error('Edge function error:', error);
      return getFallbackWeatherData(location);
    }

    if (!data) {
      return getFallbackWeatherData(location);
    }

    const { current, airQuality, hourly, daily, alerts } = data;

    // Map daily forecast to expected format
    const forecast: WeatherData['forecast'] = daily.map((day: any) => ({
      date: new Date(day.date * 1000).toISOString().split('T')[0],
      temperature: day.temperature,
      rainfall: day.rain,
      condition: day.condition,
      icon: day.icon,
    }));

    return {
      location,
      temperature: current.temperature,
      humidity: current.humidity,
      windSpeed: current.windSpeed,
      rainfall: hourly[0]?.rain || 0,
      condition: current.condition,
      icon: current.icon,
      alerts: alerts || [],
      forecast,
      feelsLike: current.feelsLike,
      pressure: current.pressure,
      windDirection: current.windDirection,
      visibility: current.visibility,
      uvIndex: current.uvIndex,
      sunrise: current.sunrise,
      sunset: current.sunset,
      isDay: current.isDay,
      airQuality: airQuality ? {
        aqi: airQuality.aqi,
        quality: airQuality.quality,
        pm25: airQuality.pm25,
        pm10: airQuality.pm10,
      } : undefined,
      hourlyForecast: hourly,
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return getFallbackWeatherData(location);
  }
};

// Map Open-Meteo WMO weather codes to readable text and icons
const mapWeatherCodeToText = (code?: number): string => {
  switch (code) {
    case 0: return 'clear sky';
    case 1:
    case 2: return 'partly cloudy';
    case 3: return 'overcast';
    case 45:
    case 48: return 'fog';
    case 51:
    case 53:
    case 55: return 'drizzle';
    case 61:
    case 63:
    case 65: return 'rain';
    case 66:
    case 67: return 'freezing rain';
    case 71:
    case 73:
    case 75: return 'snow';
    case 80:
    case 81:
    case 82: return 'rain showers';
    case 95: return 'thunderstorm';
    case 96:
    case 99: return 'thunderstorm with hail';
    default: return 'unknown';
  }
};

const mapWeatherCodeToIcon = (code?: number): string => {
  switch (code) {
    case 0: return '01d';
    case 1:
    case 2: return '02d';
    case 3: return '04d';
    case 45:
    case 48: return '50d';
    case 51:
    case 53:
    case 55: return '09d';
    case 61:
    case 63:
    case 65: return '10d';
    case 66:
    case 67: return '13d';
    case 71:
    case 73:
    case 75: return '13d';
    case 80:
    case 81:
    case 82: return '09d';
    case 95:
    case 96:
    case 99: return '11d';
    default: return '02d';
  }
};

// Fallback weather data for demo
export const getFallbackWeatherData = (location: Location): WeatherData => {
  const baseTemp = 25 + Math.sin(location.lat / 10) * 10;
  return {
    location,
    temperature: Math.round(baseTemp),
    humidity: Math.round(60 + Math.random() * 30),
    windSpeed: Math.round(5 + Math.random() * 15),
    rainfall: Math.round(Math.random() * 10),
    condition: 'partly cloudy',
    icon: '02d',
    alerts: [
      {
        id: '1',
        title: 'Heavy Rainfall Alert',
        description: 'Moderate to heavy rainfall expected in the region for next 24 hours',
        severity: 'moderate',
        start: new Date().toISOString(),
        end: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }
    ],
    forecast: Array.from({ length: 5 }, (_, i) => ({
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      temperature: {
        min: Math.round(baseTemp - 5 + Math.random() * 3),
        max: Math.round(baseTemp + 5 + Math.random() * 3)
      },
      rainfall: Math.round(Math.random() * 15),
      condition: ['sunny', 'partly cloudy', 'cloudy', 'light rain'][Math.floor(Math.random() * 4)],
      icon: ['01d', '02d', '03d', '10d'][Math.floor(Math.random() * 4)],
    })),
  };
};

// Fetch emergency facilities using Overpass API
export const fetchEmergencyFacilities = async (location: Location, radius: number = 10000): Promise<EmergencyFacility[]> => {
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="hospital"](around:${radius},${location.lat},${location.lng});
      node["amenity"="police"](around:${radius},${location.lat},${location.lng});
      node["amenity"="fire_station"](around:${radius},${location.lat},${location.lng});
      node["emergency"="assembly_point"](around:${radius},${location.lat},${location.lng});
      node["disaster:shelter"="yes"](around:${radius},${location.lat},${location.lng});
    );
    out body;
  `;

  try {
    const response = await axios.post(OVERPASS_API_URL, query, {
      headers: { 'Content-Type': 'text/plain' },
    });

    const elements = response.data.elements;

    return elements.map((element: any) => {
      const distance = calculateDistance(location, { lat: element.lat, lng: element.lon });
      
      let facilityType: 'shelter' | 'hospital' | 'police' | 'fire_station' = 'shelter';
      if (element.tags.amenity === 'hospital') facilityType = 'hospital';
      else if (element.tags.amenity === 'police') facilityType = 'police';
      else if (element.tags.amenity === 'fire_station') facilityType = 'fire_station';

      return {
        id: element.id.toString(),
        name: element.tags.name || `${facilityType.replace('_', ' ')} facility`,
        type: facilityType,
        location: { lat: element.lat, lng: element.lon },
        distance: Math.round(distance * 100) / 100,
        contact: element.tags.phone,
        capacity: element.tags.capacity ? parseInt(element.tags.capacity) : undefined,
        isOpen: element.tags.opening_hours !== 'closed',
      };
    }).sort((a: EmergencyFacility, b: EmergencyFacility) => (a.distance || 0) - (b.distance || 0));
  } catch (error) {
    console.error('Error fetching emergency facilities:', error);
    return [];
  }
};

// Geocoding search
export const searchLocation = async (query: string): Promise<Location[]> => {
  try {
    const response = await axios.get(NOMINATIM_API_URL, {
      params: {
        q: query,
        format: 'json',
        limit: 5,
        countrycodes: 'in', // Restrict to India
        addressdetails: 1,
      },
    });

    return response.data.map((result: any) => ({
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      name: result.display_name,
    }));
  } catch (error) {
    console.error('Error searching location:', error);
    return [];
  }
};

// Calculate distance between two points (Haversine formula)
export const calculateDistance = (point1: Location, point2: Location): number => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(point2.lat - point1.lat);
  const dLon = toRad(point2.lng - point1.lng);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.lat)) * Math.cos(toRad(point2.lat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (value: number): number => {
  return (value * Math.PI) / 180;
};

// Fallback disaster data removed - only showing real data from APIs

// Predict disasters using AI analysis of real data
export const predictDisastersWithAI = async (location: Location): Promise<DisasterEvent[]> => {
  try {
    console.log('🤖 Predicting disasters using AI for:', location);
    
    const { data, error } = await supabase.functions.invoke('predict-disasters', {
      body: { latitude: location.lat, longitude: location.lng }
    });

    if (error) {
      console.error('❌ Prediction error:', error);
      return [];
    }

    if (!data?.predictions) {
      console.warn('⚠️ No predictions returned');
      return [];
    }

    console.log(`✅ Received ${data.predictions.length} AI predictions`);

    // Convert AI predictions to DisasterEvent format
    return data.predictions.map((pred: any, index: number) => ({
      id: `ai-pred-${Date.now()}-${index}`,
      title: `AI Predicted ${pred.type.charAt(0).toUpperCase() + pred.type.slice(1)}`,
      location: {
        lat: location.lat,
        lng: location.lng,
        name: pred.affected_area
      },
      severity: pred.severity,
      timestamp: new Date(Date.now() + pred.timeframe_days * 24 * 60 * 60 * 1000).toISOString(),
      lat: location.lat,
      lng: location.lng,
      type: pred.type,
      description: `${pred.reasoning}\n\nProbability: ${(pred.probability * 100).toFixed(0)}%\nConfidence: ${(pred.confidence * 100).toFixed(0)}%\nExpected in: ${pred.timeframe_days} days`,
      source: 'AI Prediction',
      affectedPopulation: 0,
      isPrediction: true,
      probability: pred.probability,
      confidence: pred.confidence,
      timeframeDays: pred.timeframe_days
    }));
  } catch (error) {
    console.error('❌ Error predicting disasters:', error);
    return [];
  }
};