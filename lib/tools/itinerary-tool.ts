// tools/itinerary.ts
import { tool } from 'ai';
import { z } from 'zod';

export const itineraryTool = tool({
  description: 'Create a day-wise itinerary for a destination using SerpAPI’s Google search engine.',
  parameters: z.object({
    location: z.string().describe('Destination location, e.g., "Vilnius"'),
    days: z.number().min(1).max(10).describe('Number of days for the itinerary (1-10)'),
  }),
  execute: async ({ location, days }) => {
    const params = new URLSearchParams({
      engine: 'google',
      q: `${location} top tourist attractions`,
      api_key: process.env.SERPAPI_API_KEY!,
    });

    const url = `https://serpapi.com/search.json?${params.toString()}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      const results = data.organic_results || [];

      const attractions = results.slice(0, days * 6).map((item: any, index: number) => {
        const title = item.title || 'Unknown Attraction';
        const snippet = item.snippet || 'No description available.';
        const duration = (index % 3 === 0) ? 3 : 2; // 3 hrs for one highlight per time block, rest 2 hrs

        return { title, snippet, duration };
      });

      const itinerary: Record<string, string[]> = {};

      for (let day = 1; day <= days; day++) {
        itinerary[`Day ${day}`] = [];

        ['Morning', 'Afternoon', 'Evening'].forEach((slot, slotIndex) => {
          const start = (day - 1) * 6 + slotIndex * 2;
          const items = attractions.slice(start, start + 2);

          const section = [`#### ${slot}`];

          for (const place of items) {
            section.push(
              `- **${place.title}**: ${place.snippet} (${place.duration} hours)`
            );
          }

          itinerary[`Day ${day}`].push(section.join('\n'));
        }); 
      }

      return Object.entries(itinerary)
        .map(([day, slots]) => `### ${day}\n\n${slots.join('\n\n')}`)
        .join('\n\n');
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to generate itinerary.',
      };
    }
  },
});
