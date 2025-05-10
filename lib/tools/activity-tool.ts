import { tool } from "ai"
import { z } from "zod"
import { getActivities, getLocationInfo } from "../serpapi"

export const activityTool = tool({
  
  description: "Search for activities and attractions in a location",
  parameters: z.object({
    location: z.string().describe("The location to search for activities"),
    categories: z.array(z.string()).optional().describe('Optional categories like "outdoor", "museums", "food", etc.'),
    flightData: z.any().optional().describe("Flight data from previous steps"),
    hotelData: z.any().optional().describe("Hotel data from previous steps"),
  }),
  execute: async ({ location, categories = ["attractions", "food", "outdoor"], flightData, hotelData }) => {
    console.log(`🔍 Searching activities in ${location}`)

    // First get general location info
    const locationData = await getLocationInfo(location)

    // Then get activities for each category
    const activitiesPromises = categories.map((category) => getActivities(location, category))

    const activitiesResults = await Promise.all(activitiesPromises)

    // Combine all activities
    const allActivities = activitiesResults.flatMap((result) => result.activities)

    // Group activities by category
    const groupedActivities = categories.reduce(
      (acc, category, index) => {
        acc[category] = activitiesResults[index].activities
        return acc
      },
      {} as Record<string, any[]>,
    )

    // Format the response in an excited tone
    let response = `🎭 OMG! So many AMAZING things to do in ${location}! 🏄‍♂️\n\n`

    if (locationData.description) {
      response += `About ${location}: ${locationData.description}\n\n`
    }

    if (locationData.weather) {
      response += `Weather: ${locationData.weather} ☀️\n`
    }

    if (locationData.currency) {
      response += `Currency: ${locationData.currency} 💰\n`
    }

    if (locationData.language) {
      response += `Language: ${locationData.language} 🗣️\n\n`
    }

    // Add activities by category
    for (const category of categories) {
      const categoryActivities = groupedActivities[category] || []
      if (categoryActivities.length > 0) {
        response += `${getCategoryEmoji(category)} ${capitalizeFirstLetter(category)}:\n`

        categoryActivities.slice(0, 3).forEach((activity, index) => {
          response += `   ${index + 1}. ${activity.title}`
          if (activity.rating) {
            response += ` - ${activity.rating}⭐`
          }
          response += "\n"
        })

        response += "\n"
      }
    }

    return {
      message: response,
      locationData,
      activities: groupedActivities,
      flightData,
      hotelData,
    }
  },
})

// Helper functions
function getCategoryEmoji(category: string): string {
  const emojis: Record<string, string> = {
    attractions: "🏛️",
    food: "🍽️",
    outdoor: "🏞️",
    museums: "🖼️",
    nightlife: "🌃",
    shopping: "🛍️",
    default: "🎯",
  }

  return emojis[category.toLowerCase()] || emojis.default
}

function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1)
}
