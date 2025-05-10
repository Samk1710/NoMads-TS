// tools/flights.ts
import { tool } from 'ai';
import { z } from 'zod';
const FlightSchema = z.object({
  search_metadata: z.object({
    id: z.string(),
    status: z.string(),
    google_flights_url: z.string(),
    total_time_taken: z.number(),
  }),
  search_parameters: z.object({
    departure_id: z.string(),
    arrival_id: z.string(),
    outbound_date: z.string(),
    return_date: z.string(),
    currency: z.string(),
  }),
  best_flights: z.array(
    z.object({
      flights: z.array(
        z.object({
          departure_airport: z.object({
            name: z.string(),
            id: z.string(),
            time: z.string(),
          }),
          arrival_airport: z.object({
            name: z.string(),
            id: z.string(),
            time: z.string(),
          }),
          duration: z.number(),
          airplane: z.string().optional(),
          airline: z.string(),
          airline_logo: z.string().url(),
          travel_class: z.string().optional(),
          flight_number: z.string(),
          legroom: z.string().optional(),
          extensions: z.array(z.string()).optional(),
        })
      ),
      total_duration: z.number(),
      carbon_emissions: z.object({
        this_flight: z.number(),
        typical_for_this_route: z.number(),
        difference_percent: z.number(),
      }),
      price: z.number(),
      type: z.string(),
      airline_logo: z.string().url(),
      departure_token: z.string(),
    })
  )
});


export const flightTool=tool ({

    
  description: 'Fetches best round-trip flights between two airports using SerpAPI Google Flights engine.',
  parameters: z.object({
    departure_id: z.string().describe('Departure airport code, e.g., "CCU"'),
    arrival_id: z.string().describe('Arrival airport code, e.g., "IXZ"'),
    outbound_date: z.string().describe('Outbound flight date in YYYY-MM-DD format'),
    return_date: z.string().describe('Return flight date in YYYY-MM-DD format'),
    currency: z.string().describe('Currency code, e.g., "USD"'),
  }),
  execute: async ({ departure_id, arrival_id, outbound_date, return_date, currency }) => {
    const url = `https://serpapi.com/search.json?engine=google_flights&departure_id=${departure_id}&arrival_id=${arrival_id}&outbound_date=${outbound_date}&return_date=${return_date}&currency=${currency}&hl=en&api_key=d3760c6fd26ff00571c4df9e2510e5ad43b1413bdc1dd2946782d983c44c037c`;

    const res = await fetch(url);
    const data = await res.json();

    const validated = FlightSchema.safeParse(data);
    if (!validated.success) {
      console.error(validated.error.format());
      return { error: 'Invalid response from SerpAPI. Check schema and inputs.' };
    }

    return validated.data;
  }
});
  
