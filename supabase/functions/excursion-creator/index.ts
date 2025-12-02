import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { openai, ASSISTANT_IDS } from "../_shared/openai-client.ts";
import { corsHeaders, handleCors } from "../_shared/cors.ts";

interface ExcursionRequest {
  user_id: string;
  preferences: {
    duration_minutes?: number;
    distance_km?: number;
    difficulty?: "easy" | "moderate" | "challenging";
    terrain?: "forest" | "beach" | "mountain" | "park" | "urban";
    time_of_day?: "morning" | "afternoon" | "evening";
  };
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  health_profile?: {
    full_name: string | null;
    health_goals: string[];
    preferences: Record<string, any>;
  };
  weather_data?: {
    temperature: number;
    feels_like: number;
    humidity: number;
    description: string;
    wind_speed: number;
    conditions: string;
  };
}

function formatExcursionPrompt(req: ExcursionRequest): string {
  const parts = [];

  parts.push("Create a personalized nature therapy excursion with the following parameters:");
  parts.push(`\nLocation: ${req.location.address || `${req.location.latitude}, ${req.location.longitude}`}`);

  if (req.preferences.duration_minutes) {
    parts.push(`Duration: ${req.preferences.duration_minutes} minutes`);
  }

  if (req.preferences.distance_km) {
    parts.push(`Distance: ${req.preferences.distance_km} km`);
  }

  if (req.preferences.difficulty) {
    parts.push(`Difficulty: ${req.preferences.difficulty}`);
  }

  if (req.preferences.terrain) {
    parts.push(`Preferred terrain: ${req.preferences.terrain}`);
  }

  if (req.preferences.time_of_day) {
    parts.push(`Time of day: ${req.preferences.time_of_day}`);
  }

  if (req.weather_data) {
    parts.push(`\nCurrent weather: ${req.weather_data.description}, ${req.weather_data.temperature}°C (feels like ${req.weather_data.feels_like}°C)`);
    parts.push(`Humidity: ${req.weather_data.humidity}%, Wind speed: ${req.weather_data.wind_speed} m/s`);
  }

  if (req.health_profile) {
    if (req.health_profile.full_name) {
      parts.push(`\nUser: ${req.health_profile.full_name}`);
    }
    if (req.health_profile.health_goals && req.health_profile.health_goals.length > 0) {
      parts.push(`Health goals: ${req.health_profile.health_goals.join(", ")}`);
    }
  }

  parts.push('\nPlease provide the excursion in the following JSON format:');
  parts.push(JSON.stringify({
    title: "Excursion title",
    description: "Detailed description of the excursion and its therapeutic benefits",
    route_data: {
      waypoints: [
        {
          latitude: 0,
          longitude: 0,
          name: "Waypoint name",
          description: "Brief description",
          order: 1
        }
      ],
      start_location: {
        latitude: req.location.latitude,
        longitude: req.location.longitude,
        address: req.location.address
      },
      end_location: {
        latitude: 0,
        longitude: 0,
        address: "End location address"
      },
      terrain_type: "Terrain type",
      elevation_gain: 0
    },
    duration_minutes: 0,
    distance_km: 0,
    difficulty: "easy"
  }, null, 2));

  return parts.join("\n");
}

function parseExcursionResponse(text: string): any {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("No JSON found in response");
  } catch (error) {
    console.error("Failed to parse excursion response:", error);
    console.error("Response text:", text);
    throw new Error("Failed to parse excursion data from assistant response");
  }
}

async function createExcursion(req: ExcursionRequest) {
  try {
    const thread = await openai.beta.threads.create();

    const prompt = formatExcursionPrompt(req);

    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: prompt,
    });

    const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: ASSISTANT_IDS.EXCURSION_CREATOR,
    });

    if (run.status === "completed") {
      const messages = await openai.beta.threads.messages.list(thread.id);
      const assistantMessage = messages.data.find((msg) => msg.role === "assistant");

      if (assistantMessage && assistantMessage.content[0].type === "text") {
        const responseText = assistantMessage.content[0].text.value;
        const excursionData = parseExcursionResponse(responseText);

        return excursionData;
      }
    } else if (run.status === "requires_action") {
      throw new Error("Assistant requires function calling - not yet implemented");
    }

    throw new Error(`Run failed with status: ${run.status}`);
  } catch (error) {
    console.error("Error creating excursion:", error);
    throw error;
  }
}

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const body: ExcursionRequest = await req.json();

    if (!body.location || typeof body.location.latitude !== "number" || typeof body.location.longitude !== "number") {
      return new Response(
        JSON.stringify({ error: "Valid location with latitude and longitude is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const result = await createExcursion(body);

    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in excursion-creator function:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
