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
    const { latitude, longitude } = await req.json();
    
    if (!latitude || !longitude) {
      return new Response(
        JSON.stringify({ error: 'Latitude and longitude are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Predicting disasters for location: ${latitude}, ${longitude}`);

    // Fetch real data sources
    const [weatherData, seismicData, recentDisasters] = await Promise.all([
      fetchWeatherData(latitude, longitude),
      fetchSeismicActivity(latitude, longitude),
      fetchRecentDisasters(latitude, longitude)
    ]);

    console.log('Fetched data sources successfully');

    // Use Lovable AI to analyze patterns and predict disasters
    const predictions = await analyzePatternsWithAI(
      weatherData,
      seismicData,
      recentDisasters,
      latitude,
      longitude
    );

    return new Response(
      JSON.stringify({ predictions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in predict-disasters function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function fetchWeatherData(lat: number, lon: number) {
  const apiKey = Deno.env.get('OPENWEATHER_API_KEY');
  if (!apiKey) {
    console.warn('OPENWEATHER_API_KEY not set, using mock data');
    return { temp: 25, pressure: 1013, humidity: 65, wind_speed: 5 };
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      temp: data.main.temp,
      pressure: data.main.pressure,
      humidity: data.main.humidity,
      wind_speed: data.wind.speed,
      weather: data.weather[0].main,
      description: data.weather[0].description
    };
  } catch (error) {
    console.error('Weather fetch error:', error);
    return { temp: 25, pressure: 1013, humidity: 65, wind_speed: 5 };
  }
}

async function fetchSeismicActivity(lat: number, lon: number) {
  try {
    // Fetch earthquakes from last 30 days within 500km radius
    const radius = 5; // degrees (roughly 500km)
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const response = await fetch(
      `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${startDate}&endtime=${endDate}&latitude=${lat}&longitude=${lon}&maxradiuskm=500&minmagnitude=2.5`
    );

    if (!response.ok) {
      throw new Error(`USGS API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      count: data.features.length,
      recent_magnitudes: data.features.slice(0, 10).map((f: any) => f.properties.mag),
      max_magnitude: Math.max(...data.features.map((f: any) => f.properties.mag), 0),
      avg_magnitude: data.features.length > 0 
        ? data.features.reduce((sum: number, f: any) => sum + f.properties.mag, 0) / data.features.length 
        : 0
    };
  } catch (error) {
    console.error('Seismic data fetch error:', error);
    return { count: 0, recent_magnitudes: [], max_magnitude: 0, avg_magnitude: 0 };
  }
}

async function fetchRecentDisasters(lat: number, lon: number) {
  try {
    const response = await fetch('https://www.gdacs.org/gdacsapi/api/events/geteventlist/MAP');
    
    if (!response.ok) {
      throw new Error(`GDACS API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Filter disasters within 1000km radius
    const nearby = data.features?.filter((f: any) => {
      const [eLon, eLat] = f.geometry.coordinates;
      const distance = Math.sqrt(
        Math.pow((eLat - lat) * 111, 2) + 
        Math.pow((eLon - lon) * 111 * Math.cos(lat * Math.PI / 180), 2)
      );
      return distance < 1000;
    }) || [];

    const disasterCounts = nearby.reduce((acc: any, f: any) => {
      const type = f.properties.eventtype || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    return {
      total_count: nearby.length,
      disaster_types: disasterCounts,
      recent_events: nearby.slice(0, 5).map((f: any) => ({
        type: f.properties.eventtype,
        severity: f.properties.severitydata?.severity || 'unknown',
        date: f.properties.fromdate
      }))
    };
  } catch (error) {
    console.error('Disaster data fetch error:', error);
    return { total_count: 0, disaster_types: {}, recent_events: [] };
  }
}

async function analyzePatternsWithAI(
  weather: any,
  seismic: any,
  disasters: any,
  lat: number,
  lon: number
) {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) {
    throw new Error('LOVABLE_API_KEY is not configured');
  }

  const systemPrompt = `You are an expert disaster prediction AI that analyzes real-time data to predict potential disasters.
Analyze weather patterns, seismic activity, and historical disaster data to make evidence-based predictions.

Guidelines:
- Only predict disasters with credible supporting evidence from the data
- Consider the geographical context and typical disaster patterns for the region
- Assign realistic probability scores based on actual risk indicators
- Provide specific timeframes (next 7, 14, or 30 days)
- Include actionable reasoning based on the data patterns
- Limit predictions to 3-5 most likely scenarios`;

  const userPrompt = `Analyze the following real-time data and predict potential disasters for location (${lat}, ${lon}):

WEATHER DATA:
${JSON.stringify(weather, null, 2)}

SEISMIC ACTIVITY (last 30 days):
${JSON.stringify(seismic, null, 2)}

RECENT DISASTERS (within 1000km):
${JSON.stringify(disasters, null, 2)}

Based on this data, predict potential disasters with their probability, timeframe, and reasoning.`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      tools: [{
        type: 'function',
        function: {
          name: 'predict_disasters',
          description: 'Return disaster predictions based on data analysis',
          parameters: {
            type: 'object',
            properties: {
              predictions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    type: { 
                      type: 'string',
                      enum: ['earthquake', 'flood', 'cyclone', 'wildfire', 'drought', 'tsunami', 'landslide'],
                      description: 'Type of disaster'
                    },
                    probability: { 
                      type: 'number',
                      description: 'Probability between 0 and 1'
                    },
                    severity: {
                      type: 'string',
                      enum: ['low', 'medium', 'high', 'critical'],
                      description: 'Expected severity level'
                    },
                    timeframe_days: {
                      type: 'number',
                      description: 'Number of days until potential occurrence'
                    },
                    confidence: {
                      type: 'number',
                      description: 'Confidence in prediction (0-1)'
                    },
                    reasoning: {
                      type: 'string',
                      description: 'Evidence-based reasoning for this prediction'
                    },
                    affected_area: {
                      type: 'string',
                      description: 'Description of potentially affected area'
                    }
                  },
                  required: ['type', 'probability', 'severity', 'timeframe_days', 'confidence', 'reasoning', 'affected_area'],
                  additionalProperties: false
                }
              }
            },
            required: ['predictions'],
            additionalProperties: false
          }
        }
      }],
      tool_choice: { type: 'function', function: { name: 'predict_disasters' } }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('AI API error:', response.status, errorText);
    throw new Error(`AI API error: ${response.status}`);
  }

  const result = await response.json();
  
  if (!result.choices?.[0]?.message?.tool_calls?.[0]) {
    throw new Error('No predictions returned from AI');
  }

  const toolCall = result.choices[0].message.tool_calls[0];
  const predictions = JSON.parse(toolCall.function.arguments);
  
  console.log(`Generated ${predictions.predictions.length} disaster predictions`);
  
  return predictions.predictions;
}
