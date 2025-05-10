// tools/hotels.ts
import { tool } from 'ai';
import { z } from 'zod';

export const hotelTool = tool({
  description: 'Search for hotels in a given location using SerpAPI’s Google Hotels engine.',
  parameters: z.object({
    location: z.string().describe('Search query for the hotel location, e.g., "Bali Resorts"'),
    check_in_date: z.string().describe('Check-in date in YYYY-MM-DD format'),
    check_out_date: z.string().describe('Check-out date in YYYY-MM-DD format'),
    adults: z.number().describe('Number of adults'),
    currency: z.string().default('USD').describe('Currency code, e.g., "USD"'),
    gl: z.string().default('us').describe('Country code for the search, e.g., "us"'),
    hl: z.string().default('en').describe('Language code, e.g., "en"'),
  }),
  execute: async ({ location, check_in_date, check_out_date, adults, currency, gl, hl }) => {
    const params = new URLSearchParams({
      engine: 'google_hotels',
      q: location,
      check_in_date,
      check_out_date,
      adults: adults.toString(),
      currency,
      gl,
      hl,
      api_key: process.env.SERPAPI_API_KEY!
    });

    const url = `https://serpapi.com/search.json?${params.toString()}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.brands) {
        return data.brands;
      } else {
        throw new Error(data.error || 'No hotel data found.');
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch hotel details.',
      };
    //   if (data.best_flights) {
    //     return data.best_flights;
    //   } else {
    //     throw new Error(data.error || 'No flight data found.');
    //   }
    // } catch (error: any) {
    //   return {
    //     success: false,
    //     error: error.message || 'Failed to fetch flight details.',
    //   };
    }
  },
});
