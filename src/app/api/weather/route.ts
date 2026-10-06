import { NextResponse } from "next/server";

export interface WeatherData {
  location: string;
  country: string;
  latitude: number;
  longitude: number;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windGust: number;
  windDirection: number;
  pressure: number;
  uvIndex: number;
  visibility: number;
  precipitationProbability: number;
  conditions: string;
  weatherCode: number;
  isDay: boolean;
  hourlyForecast: {
    time: string;
    temperature: number;
    weatherCode: number;
  }[];
}

const DEFAULT_WEATHER: WeatherData = {
  location: "Zurich",
  country: "Switzerland",
  latitude: 47.3769,
  longitude: 8.5417,
  temperature: 15.4,
  feelsLike: 14.8,
  humidity: 62,
  windSpeed: 12.5,
  windGust: 21.0,
  windDirection: 240,
  pressure: 1018.2,
  uvIndex: 4.2,
  visibility: 24.5,
  precipitationProbability: 15,
  conditions: "Partly cloudy",
  weatherCode: 2,
  isDay: true,
  hourlyForecast: [
    { time: "12:00", temperature: 15.4, weatherCode: 2 },
    { time: "14:00", temperature: 17.1, weatherCode: 1 },
    { time: "16:00", temperature: 16.8, weatherCode: 1 },
    { time: "18:00", temperature: 14.5, weatherCode: 2 },
    { time: "20:00", temperature: 12.2, weatherCode: 3 },
    { time: "22:00", temperature: 10.9, weatherCode: 3 },
  ],
};

function getWeatherCondition(code: number): string {
  const conditions: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
  };
  return conditions[code] || "Fair";
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city") || "Zurich";

  try {
    const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      city
    )}&count=1&language=en&format=json`;

    const geocodingRes = await fetch(geocodingUrl, { next: { revalidate: 300 } });
    if (!geocodingRes.ok) {
      return NextResponse.json(DEFAULT_WEATHER);
    }

    const geocodingData = await geocodingRes.json();
    if (!geocodingData.results?.[0]) {
      return NextResponse.json({
        ...DEFAULT_WEATHER,
        location: city,
      });
    }

    const { latitude, longitude, name, country } = geocodingData.results[0];

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,weather_code,uv_index,visibility,precipitation_probability&timezone=auto&forecast_days=2`;

    const weatherRes = await fetch(weatherUrl, { next: { revalidate: 180 } });
    if (!weatherRes.ok) {
      return NextResponse.json(DEFAULT_WEATHER);
    }

    const weatherData = await weatherRes.json();
    const current = weatherData.current;
    const hourly = weatherData.hourly;

    const currentHourIndex = Math.max(0, new Date().getHours());
    const uvIndex = hourly?.uv_index?.[currentHourIndex] ?? 3.5;
    const visibilityKm = Math.round((hourly?.visibility?.[currentHourIndex] ?? 20000) / 1000);
    const precipProb = hourly?.precipitation_probability?.[currentHourIndex] ?? 10;

    const hourlyForecast = (hourly?.time || [])
      .slice(currentHourIndex, currentHourIndex + 6)
      .map((timeStr: string, idx: number) => {
        const timeFormatted = timeStr.split("T")[1]?.slice(0, 5) || `${idx * 2}:00`;
        return {
          time: timeFormatted,
          temperature: Math.round(hourly.temperature_2m[currentHourIndex + idx] ?? 15),
          weatherCode: hourly.weather_code[currentHourIndex + idx] ?? 1,
        };
      });

    const result: WeatherData = {
      location: name,
      country: country || "",
      latitude,
      longitude,
      temperature: Math.round(current.temperature_2m * 10) / 10,
      feelsLike: Math.round(current.apparent_temperature * 10) / 10,
      humidity: Math.round(current.relative_humidity_2m),
      windSpeed: Math.round(current.wind_speed_10m * 10) / 10,
      windGust: Math.round(current.wind_gusts_10m * 10) / 10,
      windDirection: Math.round(current.wind_direction_10m),
      pressure: Math.round(current.surface_pressure * 10) / 10,
      uvIndex: Math.round(uvIndex * 10) / 10,
      visibility: visibilityKm,
      precipitationProbability: precipProb,
      conditions: getWeatherCondition(current.weather_code),
      weatherCode: current.weather_code,
      isDay: current.is_day === 1,
      hourlyForecast: hourlyForecast.length > 0 ? hourlyForecast : DEFAULT_WEATHER.hourlyForecast,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch weather:", error);
    return NextResponse.json(DEFAULT_WEATHER);
  }
}
