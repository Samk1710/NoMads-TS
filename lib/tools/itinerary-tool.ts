// tools/itinerary.ts
import { tool } from 'ai';
import { z } from 'zod';

export const itineraryTool = tool({
  description: 'Create a rich, themed, day-wise itinerary using SerpAPI’s Google search results.',
  parameters: z.object({
    location: z.string().describe('Destination location, e.g., "Vilnius"'),
    days: z.number().min(1).max(10).describe('Number of days for the itinerary (1-10)'),
  }),
  execute: async ({ location, days }) => {
    const params = new URLSearchParams({
      engine: 'google',
      q: `${location} top tourist attractions detailed`,
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
        const link = item.link ? `More info: ${item.link}` : '';
        const duration = (index % 3 === 0) ? 3 : 2; // Longer for primary sites

        return { title, snippet, link, duration };
      });

      const themes = [
        'Historical Sites',
        'Museums and Memorials',
        'Religious Architecture',
        'Natural Wonders',
        'Cultural Landmarks',
        'Modern Attractions',
        'Hidden Gems',
        'Art and Creativity',
        'Food and Markets',
        'City Highlights'
      ];

      const itinerary: string[] = [];

      for (let day = 1; day <= days; day++) {
        const focus = themes[(day - 1) % themes.length];
        const sections: string[] = [`### Day ${day}\n\n**Focus:** ${focus}\n`];

        ['Morning', 'Afternoon', 'Evening'].forEach((slot, i) => {
          const start = (day - 1) * 6 + i * 2;
          const places = attractions.slice(start, start + 2);

          const block = [`#### ${slot}`];

          for (const place of places) {
            block.push(
              `- **${place.title}**: ${place.snippet} (${place.duration} hours)\n${place.link}`
            );
          }

          sections.push(block.join('\n'));
        });

        itinerary.push(sections.join('\n\n'));
      }

      return itinerary.join('\n\n');
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to generate itinerary.',
      };
    }
  },
});
