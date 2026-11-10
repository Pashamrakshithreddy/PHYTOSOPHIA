/**
 * PhytoSophia Ambient Weather & Microclimate Telemetry Service
 * Delivers ambient environmental telemetry (temperature, humidity, UV index, soil microclimate, precipitation probability)
 * and generates AI microclimate advice & dynamic watering adjustments.
 */

export interface WeatherTelemetry {
  locationName: string;
  temperatureC: number;
  temperatureF: number;
  humidityPercent: number;
  uvIndex: number;
  soilMoistureEstPercent: number;
  rainProbabilityPercent: number;
  weatherCondition: 'Sunny' | 'Partly Cloudy' | 'Rainy' | 'Humid & Overcast' | 'Dry Heat';
  windSpeedKmh: number;
  airQualityAqi: number;
  lastUpdated: string;
}

export interface MicroclimateAdvice {
  id: string;
  type: 'watering-adjust' | 'uv-warning' | 'humidity-alert' | 'fertilizer-hint';
  severity: 'info' | 'warning' | 'alert';
  title: string;
  message: string;
  targetPlantCategory?: string;
  recommendedAction: string;
  autoAdjustApplied?: boolean;
}

export const PRESET_MICROCLIMATES: Record<string, WeatherTelemetry> = {
  balcony: {
    locationName: 'Balcony Terrace Garden',
    temperatureC: 27,
    temperatureF: 80.6,
    humidityPercent: 68,
    uvIndex: 7,
    soilMoistureEstPercent: 44,
    rainProbabilityPercent: 65, // High rain probability for dynamic adjustment demo
    weatherCondition: 'Humid & Overcast',
    windSpeedKmh: 14,
    airQualityAqi: 42,
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
  indoor: {
    locationName: 'Living Room Urban Oasis',
    temperatureC: 23,
    temperatureF: 73.4,
    humidityPercent: 52,
    uvIndex: 2,
    soilMoistureEstPercent: 58,
    rainProbabilityPercent: 0,
    weatherCondition: 'Partly Cloudy',
    windSpeedKmh: 3,
    airQualityAqi: 28,
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
  greenhouse: {
    locationName: 'Glasshouse Sanctuary',
    temperatureC: 29,
    temperatureF: 84.2,
    humidityPercent: 78,
    uvIndex: 5,
    soilMoistureEstPercent: 72,
    rainProbabilityPercent: 10,
    weatherCondition: 'Sunny',
    windSpeedKmh: 2,
    airQualityAqi: 15,
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
};

export function getMicroclimateTelemetry(locationKey: 'balcony' | 'indoor' | 'greenhouse' = 'balcony'): WeatherTelemetry {
  return PRESET_MICROCLIMATES[locationKey] || PRESET_MICROCLIMATES.balcony;
}

export function generateMicroclimateAdvice(weather: WeatherTelemetry, outdoorPlantCount: number = 0): MicroclimateAdvice[] {
  const advices: MicroclimateAdvice[] = [];

  // Dynamic Weather-based watering adjustment
  if (weather.rainProbabilityPercent >= 50 && outdoorPlantCount > 0) {
    advices.push({
      id: 'adv-rain-postpone',
      type: 'watering-adjust',
      severity: 'alert',
      title: '🌧️ Rain Forecast: Automated Watering Postponement',
      message: `${weather.rainProbabilityPercent}% precipitation probability detected for ${weather.locationName}. Outdoor digital twins have had their watering schedules automatically deferred by 24h to protect roots from hypoxia.`,
      targetPlantCategory: 'outdoor',
      recommendedAction: 'Keep outdoor plants in natural rainfall trajectory. Delay manual supplemental watering.',
      autoAdjustApplied: true,
    });
  }

  // High UV warning
  if (weather.uvIndex >= 6) {
    advices.push({
      id: 'adv-uv-high',
      type: 'uv-warning',
      severity: 'warning',
      title: '☀️ Intense Solar Radiation Alert',
      message: `UV index peak of ${weather.uvIndex} recorded. Sensitive foliage (juvenile Monsteras, Pothos, and Calatheas) should be shielded or moved to filtered light between 11 AM - 3 PM to prevent leaf scorch.`,
      recommendedAction: 'Close sheer curtains or deploy 30% shade mesh.',
    });
  }

  // High humidity fungal advisory
  if (weather.humidityPercent >= 65) {
    advices.push({
      id: 'adv-humidity-fungal',
      type: 'humidity-alert',
      severity: 'info',
      title: '💨 Microclimate Humidity Warning',
      message: `Ambient relative humidity is ${weather.humidityPercent}%. Ensure adequate oscillating airflow around clustered tropicals to inhibit powdery mildew and fungal spore germination.`,
      recommendedAction: 'Engage gentle oscillating fan or space plants 10cm further apart.',
    });
  }

  return advices;
}
