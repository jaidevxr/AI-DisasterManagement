import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, location, language = 'en' } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Received request with location:', location, 'language:', language);

    const languageNames: { [key: string]: string } = {
      'en': 'English',
      'hi': 'Hindi (हिन्दी)',
      'ta': 'Tamil (தமிழ்)',
      'bn': 'Bengali (বাংলা)',
      'te': 'Telugu (తెలుగు)',
      'mr': 'Marathi (मराठी)',
      'gu': 'Gujarati (ગુજરાતી)',
      'kn': 'Kannada (ಕನ್ನಡ)',
      'ml': 'Malayalam (മലയാളം)',
      'pa': 'Punjabi (ਪੰਜਾਬੀ)'
    };
    
    const selectedLanguage = languageNames[language] || 'English';

    // Define tools for the LLM
    const tools = [
      {
        type: "function",
        function: {
          name: "getWeather",
          description: "Get current weather data for a location",
          parameters: {
            type: "object",
            properties: {
              lat: { type: "number", description: "Latitude" },
              lng: { type: "number", description: "Longitude" }
            },
            required: ["lat", "lng"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "getRisk",
          description: "Get disaster risk assessment for a location",
          parameters: {
            type: "object",
            properties: {
              lat: { type: "number", description: "Latitude" },
              lng: { type: "number", description: "Longitude" }
            },
            required: ["lat", "lng"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "getNearby",
          description: "Get nearby emergency facilities like hospitals, police stations, fire stations",
          parameters: {
            type: "object",
            properties: {
              lat: { type: "number", description: "Latitude" },
              lng: { type: "number", description: "Longitude" },
              radius: { type: "number", description: "Search radius in meters", default: 5000 }
            },
            required: ["lat", "lng"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "getAlerts",
          description: "Get current disaster alerts and warnings for India",
          parameters: {
            type: "object",
            properties: {}
          }
        }
      },
      {
        type: "function",
        function: {
          name: "getEvacuationPlan",
          description: "Generate a smart evacuation plan based on disaster type, weather conditions, and user location",
          parameters: {
            type: "object",
            properties: {
              lat: { type: "number", description: "Latitude" },
              lng: { type: "number", description: "Longitude" },
              disasterType: { 
                type: "string", 
                description: "Type of disaster: earthquake, flood, cyclone, fire, landslide",
                enum: ["earthquake", "flood", "cyclone", "fire", "landslide"]
              }
            },
            required: ["lat", "lng", "disasterType"]
          }
        }
      }
    ];

    // Enhanced system prompt with medical advice and evacuation planning
    const systemMessage = {
      role: "system",
      content: `You are Saarthi, an advanced disaster response and medical AI assistant for India. You ONLY respond to disaster-related and medical/health-related queries. Your expertise includes:

**Core Capabilities:**
- Weather information and forecasts with disaster implications
- Disaster risk assessments and predictive analytics
- Finding and navigating to emergency services (hospitals, police, fire stations, shelters)
- Current disaster alerts and warnings for India
- Basic medical first aid advice during emergencies (CPR, wound care, burns, fractures, choking, etc.)
- Smart evacuation planning based on disaster type, weather, and location

**Medical Emergency Guidelines:**
When providing medical advice:
- Give clear, step-by-step first aid instructions
- Emphasize when to seek immediate professional help (call 108/102/112)
- Provide basic stabilization techniques until help arrives
- Focus on life-threatening situations: severe bleeding, breathing difficulties, unconsciousness, chest pain, severe burns
- For common emergencies: fractures (immobilize), burns (cool water), wounds (pressure to stop bleeding), CPR (30 compressions, 2 breaths)
- ALWAYS advise users to seek professional medical help - your advice is for immediate stabilization only

**Evacuation Planning:**
When asked about evacuation:
- Analyze the disaster type (earthquake, flood, cyclone, fire, landslide)
- Consider real-time weather conditions and forecasts
- Identify safe evacuation routes avoiding disaster zones
- Recommend nearest shelters and safe zones
- Provide step-by-step evacuation instructions
- Suggest what to bring (documents, water, first aid, phone, charger, medicines)
- Give timing recommendations based on disaster severity

**Hospital Navigation:**
When users ask about hospitals:
- Provide hospital names with distances
- Include "Get Directions" action for navigation
- Prioritize by distance and specify the type of facility
- Include contact numbers when available

${location ? `The user is currently at coordinates: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}. Use this location automatically when they ask about "here", "my location", "nearby", or similar context-based queries.` : ''}

**CRITICAL RESTRICTION:**
You MUST ONLY respond to queries related to:
- Disasters (earthquakes, floods, cyclones, fires, landslides, etc.)
- Medical emergencies and health issues
- First aid and emergency medical care
- Weather and disaster preparedness
- Emergency services and evacuation

For ANY other topic (general knowledge, entertainment, technology, sports, politics, casual conversation, etc.), politely respond: "I'm Saarthi, specialized in disaster response and medical emergencies. I can only help with health, safety, and disaster-related questions. Please ask me about medical emergencies, disasters, weather, or emergency services."

**LANGUAGE INSTRUCTION:**
The user has selected ${selectedLanguage} as their preferred language. You MUST respond in ${selectedLanguage} ONLY. All your responses, including medical advice, disaster information, and emergency instructions, must be in ${selectedLanguage}. Use native script and natural language appropriate for ${selectedLanguage} speakers.

Always be concise, actionable, and prioritize life safety. When providing location-based information, mention the general area (city/region) to help users confirm accuracy.`
    };

    // Call Lovable AI Gateway
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [systemMessage, ...messages],
        tools: tools,
        tool_choice: "auto",
        temperature: 0.7,
        max_tokens: 2000
      }),
    });

    const data = await response.json();
    console.log('AI response:', JSON.stringify(data));

    // Check for API errors
    if (data.error) {
      throw new Error(`AI API error: ${data.error.message || JSON.stringify(data.error)}`);
    }

    if (!data.choices || !data.choices[0]) {
      throw new Error('Invalid response from AI API');
    }

    // Check if the model wants to call tools
    if (data.choices[0].message.tool_calls) {
      const toolCalls = data.choices[0].message.tool_calls;
      const toolResults = [];

      for (const toolCall of toolCalls) {
        const functionName = toolCall.function.name;
        let args = JSON.parse(toolCall.function.arguments);

        // Auto-fill location if not provided
        if ((functionName === 'getWeather' || functionName === 'getRisk' || functionName === 'getNearby' || functionName === 'getEvacuationPlan') 
            && (!args.lat || !args.lng) && location) {
          args.lat = location.lat;
          args.lng = location.lng;
        }

        console.log(`Calling ${functionName} with args:`, args);
        let result;

        try {
          switch (functionName) {
            case 'getWeather':
              result = await getWeather(args.lat, args.lng);
              break;
            case 'getRisk':
              result = await getRisk(args.lat, args.lng);
              break;
            case 'getNearby':
              result = await getNearby(args.lat, args.lng, args.radius || 5000);
              break;
            case 'getAlerts':
              result = await getAlerts();
              break;
            case 'getEvacuationPlan':
              result = await getEvacuationPlan(args.lat, args.lng, args.disasterType);
              break;
            default:
              result = { error: 'Unknown function' };
          }
        } catch (error) {
          console.error(`Error calling ${functionName}:`, error);
          result = { error: error.message };
        }

        toolResults.push({
          tool_call_id: toolCall.id,
          role: "tool",
          name: functionName,
          content: JSON.stringify(result)
        });
      }

      // Call AI again with tool results
      const finalResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-pro',
          messages: [
            systemMessage,
            ...messages,
            data.choices[0].message,
            ...toolResults
          ],
          temperature: 0.7,
          max_tokens: 2000
        }),
      });

      const finalData = await finalResponse.json();
      console.log('Final response:', JSON.stringify(finalData));

      // Check for errors in final response
      if (finalData.error) {
        throw new Error(`AI API error: ${finalData.error.message || JSON.stringify(finalData.error)}`);
      }

      if (!finalData.choices || !finalData.choices[0]) {
        throw new Error('Invalid final response from AI API');
      }

      return new Response(JSON.stringify({ 
        message: finalData.choices[0].message.content 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // No tool calls, return direct response
    return new Response(JSON.stringify({ 
      message: data.choices[0].message.content 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in copilot-chat function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Tool implementations
async function getWeather(lat: number, lng: number) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Asia/Kolkata`;
    const response = await fetch(url);
    const data = await response.json();

    return {
      temperature: Math.round(data.current.temperature_2m),
      humidity: data.current.relative_humidity_2m,
      windSpeed: Math.round(data.current.wind_speed_10m),
      rainfall: data.current.precipitation,
      condition: mapWeatherCode(data.current.weather_code),
      forecast: data.daily.time.slice(0, 3).map((date: string, i: number) => ({
        date,
        tempMax: Math.round(data.daily.temperature_2m_max[i]),
        tempMin: Math.round(data.daily.temperature_2m_min[i]),
        rainfall: data.daily.precipitation_sum[i]
      }))
    };
  } catch (error) {
    console.error('Weather API error:', error);
    return { error: 'Unable to fetch weather data' };
  }
}

async function getRisk(lat: number, lng: number) {
  try {
    // Fetch recent earthquakes
    const earthquakeUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_day.geojson';
    const response = await fetch(earthquakeUrl);
    const data = await response.json();

    // Check for nearby disasters (within 500km)
    const nearbyEvents = data.features.filter((feature: any) => {
      const [eLng, eLat] = feature.geometry.coordinates;
      const distance = calculateDistance(lat, lng, eLat, eLng);
      return distance < 500;
    });

    let riskLevel = 'low';
    let factors = [];

    if (nearbyEvents.length > 0) {
      riskLevel = 'high';
      factors.push(`${nearbyEvents.length} recent earthquake(s) detected nearby`);
    }

    // Check monsoon season (June-September)
    const month = new Date().getMonth() + 1;
    if (month >= 6 && month <= 9) {
      riskLevel = riskLevel === 'low' ? 'medium' : 'high';
      factors.push('Monsoon season - increased flood risk');
    }

    return {
      riskLevel,
      factors: factors.length > 0 ? factors : ['No immediate threats detected'],
      nearbyEvents: nearbyEvents.length
    };
  } catch (error) {
    console.error('Risk assessment error:', error);
    return { error: 'Unable to assess risk' };
  }
}

async function getNearby(lat: number, lng: number, radius: number) {
  try {
    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="hospital"](around:${radius},${lat},${lng});
        node["amenity"="police"](around:${radius},${lat},${lng});
        node["amenity"="fire_station"](around:${radius},${lat},${lng});
        node["emergency"="assembly_point"](around:${radius},${lat},${lng});
        node["amenity"="shelter"](around:${radius},${lat},${lng});
      );
      out body;
    `;

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
    });

    const data = await response.json();
    
    const facilities = data.elements.map((element: any) => {
      const type = element.tags.amenity === 'hospital' ? 'hospital' 
                 : element.tags.amenity === 'police' ? 'police'
                 : element.tags.amenity === 'fire_station' ? 'fire_station'
                 : element.tags.emergency === 'assembly_point' ? 'shelter'
                 : 'shelter';

      return {
        name: element.tags.name || `${type} facility`,
        type,
        lat: element.lat,
        lng: element.lon,
        distance: Math.round(calculateDistance(lat, lng, element.lat, element.lon) * 1000),
        contact: element.tags.phone || element.tags.contact
      };
    });

    return {
      count: facilities.length,
      facilities: facilities.slice(0, 10).sort((a: any, b: any) => a.distance - b.distance),
      userLocation: { lat, lng }
    };
  } catch (error) {
    console.error('Nearby facilities error:', error);
    return { error: 'Unable to fetch nearby facilities' };
  }
}

async function getAlerts() {
  try {
    const response = await fetch(
      'https://api.reliefweb.int/v1/disasters?appname=apidoc&filter[field]=country.iso3&filter[value]=IND&filter[field]=status&filter[value]=current&limit=5'
    );
    const data = await response.json();

    const alerts = data.data.map((item: any) => ({
      title: item.fields.name,
      type: item.fields.type?.[0]?.name || 'Unknown',
      status: item.fields.status,
      date: item.fields.date?.created
    }));

    return {
      count: alerts.length,
      alerts: alerts.length > 0 ? alerts : [{ message: 'No active alerts at this time' }]
    };
  } catch (error) {
    console.error('Alerts API error:', error);
    return { error: 'Unable to fetch alerts' };
  }
}

// Helper functions
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function mapWeatherCode(code: number): string {
  const weatherCodes: { [key: number]: string } = {
    0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
    45: 'Foggy', 48: 'Foggy', 51: 'Light drizzle', 53: 'Moderate drizzle',
    55: 'Dense drizzle', 61: 'Light rain', 63: 'Moderate rain', 65: 'Heavy rain',
    71: 'Light snow', 73: 'Moderate snow', 75: 'Heavy snow', 80: 'Light rain showers',
    81: 'Moderate rain showers', 82: 'Violent rain showers', 95: 'Thunderstorm',
    96: 'Thunderstorm with light hail', 99: 'Thunderstorm with heavy hail'
  };
  return weatherCodes[code] || 'Unknown';
}

async function getEvacuationPlan(lat: number, lng: number, disasterType: string) {
  try {
    // Get weather data
    const weatherData = await getWeather(lat, lng);
    
    // Get nearby shelters and safe zones
    const facilitiesData = await getNearby(lat, lng, 10000); // 10km radius
    
    // Get risk assessment
    const riskData = await getRisk(lat, lng);

    const shelters = facilitiesData.facilities?.filter((f: any) => f.type === 'shelter') || [];
    const hospitals = facilitiesData.facilities?.filter((f: any) => f.type === 'hospital').slice(0, 3) || [];

    // Disaster-specific evacuation guidance
    const disasterGuidance: { [key: string]: any } = {
      earthquake: {
        immediate: ['Drop, Cover, and Hold On', 'Stay away from windows and heavy objects', 'If outdoors, move to open area away from buildings'],
        evacuation: ['Wait for shaking to stop before evacuating', 'Use stairs, never elevators', 'Watch for aftershocks'],
        safety: ['Check for gas leaks before using electricity', 'Stay away from damaged buildings'],
        routes: 'Avoid bridges, overpasses, and areas with tall buildings'
      },
      flood: {
        immediate: ['Move to higher ground immediately', 'Avoid walking/driving through flood water', 'Turn off electricity at main breaker'],
        evacuation: ['Head to highest floor or rooftop if trapped', 'Follow designated evacuation routes', 'Never drive through flooded roads'],
        safety: ['Stay away from power lines and electrical wires', 'Avoid river banks and low-lying areas'],
        routes: 'Use elevated roads and bridges, avoid low-lying areas and water crossings'
      },
      cyclone: {
        immediate: ['Stay indoors away from windows', 'Secure loose objects outside', 'Keep emergency supplies ready'],
        evacuation: ['Follow official evacuation orders', 'Move to designated cyclone shelters', 'Secure your home before leaving'],
        safety: ['Stay away from coastal areas', 'Avoid flooded roads and fallen power lines'],
        routes: 'Move inland away from coast, use designated cyclone evacuation routes'
      },
      fire: {
        immediate: ['Alert others and call 101 (fire emergency)', 'Stay low to avoid smoke', 'Feel doors before opening'],
        evacuation: ['Leave immediately, do not collect belongings', 'Close doors behind you to slow fire spread', 'Never use elevators'],
        safety: ['If clothes catch fire: Stop, Drop, and Roll', 'Never go back inside a burning building'],
        routes: 'Move perpendicular to wind direction, avoid dense smoke areas'
      },
      landslide: {
        immediate: ['Move away from the landslide path', 'Alert neighbors of danger', 'Listen for unusual sounds (trees cracking, boulders knocking)'],
        evacuation: ['Move to higher ground perpendicular to landslide', 'Avoid river valleys and low areas', 'Stay alert for flooding'],
        safety: ['Watch for changes in water level in streams', 'Be aware of sudden changes in landscape'],
        routes: 'Move to stable, elevated ground away from slopes'
      }
    };

    const guidance = disasterGuidance[disasterType] || disasterGuidance.earthquake;

    return {
      disasterType,
      location: { lat, lng },
      weather: {
        condition: weatherData.condition,
        temperature: weatherData.temperature,
        windSpeed: weatherData.windSpeed,
        rainfall: weatherData.rainfall
      },
      riskLevel: riskData.riskLevel,
      immediateActions: guidance.immediate,
      evacuationSteps: guidance.evacuation,
      safetyTips: guidance.safety,
      routeGuidance: guidance.routes,
      nearestShelters: shelters.slice(0, 5),
      nearestHospitals: hospitals,
      essentialItems: [
        'Government ID and important documents (in waterproof bag)',
        'Water (1 gallon per person per day for 3 days)',
        'Non-perishable food for 3 days',
        'First aid kit and prescription medications',
        'Mobile phone with charger and power bank',
        'Flashlight with extra batteries',
        'Cash and credit cards',
        'Emergency contact list',
        'Whistle for signaling help',
        'Dust masks or cloth for air filtration'
      ],
      emergencyContacts: {
        nationalEmergency: '112',
        ambulance: '102/108',
        fire: '101',
        police: '100',
        disasterManagement: '1078',
        womenHelpline: '1091'
      }
    };
  } catch (error) {
    console.error('Evacuation planning error:', error);
    return { error: 'Unable to generate evacuation plan' };
  }
}
