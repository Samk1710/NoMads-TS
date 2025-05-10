import { tool } from "ai"
import { z } from "zod"

export const itineraryTool = tool({
  
  description: "Create a detailed day-by-day itinerary based on all the collected information",
  parameters: z.object({
    destination: z.string().describe("The main destination"),
    startDate: z.string().describe("Start date in YYYY-MM-DD format"),
    endDate: z.string().describe("End date in YYYY-MM-DD format"),
    flightData: z.any().describe("Flight information from previous steps"),
    hotelData: z.any().describe("Hotel information from previous steps"),
    locationData: z.any().describe("Location information from previous steps"),
    activities: z.any().describe("Activities information from previous steps"),
  }),
  execute: async ({ destination, startDate, endDate, flightData, hotelData, locationData, activities }) => {
    console.log(`📝 Creating itinerary for ${destination} from ${startDate} to ${endDate}`)

    // Calculate number of days
    const start = new Date(startDate)
    const end = new Date(endDate)
    const numberOfDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

    // Format the response in an excited tone
    let response = `✨ YOUR AMAZING ${destination.toUpperCase()} ADVENTURE! ✨\n\n`

    // Add trip overview
    response += `🗓️ ${formatDate(startDate)} to ${formatDate(endDate)} (${numberOfDays} days)\n\n`

    // Add flight information if available
    if (flightData?.flights?.length > 0) {
      const bestFlight = flightData.flights[0]
      response += `✈️ FLIGHT DETAILS:\n`
      response += `   Going: ${flightData.origin} to ${flightData.destination}\n`
      response += `   ${bestFlight.airline} ${bestFlight.flightNumber} - ${bestFlight.departureTime} to ${bestFlight.arrivalTime}\n\n`

      if (flightData.returnDate) {
        response += `   Return: Details will be confirmed closer to the date\n\n`
      }
    }

    // Add hotel information if available
    if (hotelData?.hotels?.length > 0) {
      const bestHotel = hotelData.hotels[0]
      response += `🏨 ACCOMMODATION:\n`
      response += `   ${bestHotel.name} - ${bestHotel.rating}⭐\n`
      response += `   ${bestHotel.address}\n`
      response += `   ${bestHotel.price} per night\n\n`
    }

    // Create day-by-day itinerary
    response += `📅 DAY-BY-DAY ITINERARY:\n\n`

    // Get all activities and sort them by category for distribution across days
    const allActivitiesByCategory: Record<string, any[]> = activities || {}

    // Create a simple distribution of activities across days
    for (let day = 1; day <= numberOfDays; day++) {
      const currentDate = new Date(start)
      currentDate.setDate(start.getDate() + day - 1)

      response += `🌅 DAY ${day} - ${formatDate(currentDate.toISOString().split("T")[0])}:\n\n`

      if (day === 1) {
        response += `   Morning: Arrive in ${destination}! Check in to your hotel and freshen up.\n`
        response += `   Afternoon: Explore the area around your hotel - get your bearings!\n`

        // Add an evening activity from food category if available
        const foodActivities = allActivitiesByCategory["food"] || []
        if (foodActivities.length > 0) {
          response += `   Evening: Dinner at ${foodActivities[0].title} - perfect way to start your trip!\n`
        } else {
          response += `   Evening: Find a local restaurant and enjoy your first meal in ${destination}!\n`
        }
      } else if (day === numberOfDays) {
        response += `   Morning: Last chance to visit any spots you missed!\n`

        // Add a morning activity from attractions if available
        const attractions = allActivitiesByCategory["attractions"] || []
        if (attractions.length > 0 && day % attractions.length < attractions.length) {
          response += `   Suggestion: Visit ${attractions[day % attractions.length].title}\n`
        }

        response += `   Afternoon: Pack up and prepare for departure.\n`
        response += `   Evening: Head to the airport. Bye ${destination}, until next time! 👋\n`
      } else {
        // For middle days, distribute activities from different categories
        const dayMod = day % 3 // Use modulo to cycle through activity types

        if (dayMod === 0) {
          // Culture day
          const museums = allActivitiesByCategory["museums"] || allActivitiesByCategory["attractions"] || []
          if (museums.length > 0) {
            const index = (day / 3) % museums.length
            response += `   Morning: Visit ${museums[index].title}\n`
          } else {
            response += `   Morning: Explore the cultural highlights of ${destination}\n`
          }

          response += `   Afternoon: Continue your cultural exploration\n`

          const foodActivities = allActivitiesByCategory["food"] || []
          if (foodActivities.length > 0) {
            const index = day % foodActivities.length
            response += `   Evening: Dinner at ${foodActivities[index].title}\n`
          } else {
            response += `   Evening: Try some local cuisine!\n`
          }
        } else if (dayMod === 1) {
          // Nature/outdoor day
          const outdoorActivities = allActivitiesByCategory["outdoor"] || []
          if (outdoorActivities.length > 0) {
            const index = Math.floor(day / 3) % outdoorActivities.length
            response += `   Morning & Afternoon: Full day adventure at ${outdoorActivities[index].title}\n`
          } else {
            response += `   Morning & Afternoon: Explore the natural beauty around ${destination}\n`
          }

          response += `   Evening: Relax after your active day - maybe try a local bar or cafe?\n`
        } else {
          // Mixed day
          const attractions = allActivitiesByCategory["attractions"] || []
          if (attractions.length > 0) {
            const index = day % attractions.length
            response += `   Morning: Check out ${attractions[index].title}\n`
          } else {
            response += `   Morning: Explore a different neighborhood of ${destination}\n`
          }

          const shopping = allActivitiesByCategory["shopping"] || []
          if (shopping.length > 0) {
            const index = day % shopping.length
            response += `   Afternoon: Shopping at ${shopping[index].title}\n`
          } else {
            response += `   Afternoon: Shop for souvenirs or local specialties\n`
          }

          const nightlife = allActivitiesByCategory["nightlife"] || allActivitiesByCategory["food"] || []
          if (nightlife.length > 0) {
            const index = day % nightlife.length
            response += `   Evening: Experience ${nightlife[index].title}\n`
          } else {
            response += `   Evening: Experience the local nightlife\n`
          }
        }
      }

      response += "\n"
    }

    // Add tips section
    response += `💡 TRAVEL TIPS:\n`
    if (locationData?.currency) {
      response += `   - Currency: ${locationData.currency} - make sure to have some cash on hand!\n`
    }
    if (locationData?.language) {
      response += `   - Language: ${locationData.language} - learning a few basic phrases goes a long way!\n`
    }
    response += `   - Weather: Pack accordingly for the season\n`
    response += `   - Transportation: Research local transit options before arriving\n`
    response += `   - Safety: Keep your belongings secure and be aware of your surroundings\n\n`

    response += `I'm SO EXCITED for your trip to ${destination}! This itinerary is just a suggestion - feel free to mix things up and make it your own! 🎉 Let me know if you want any changes or have questions! 🙌`

    return {
      message: response,
      itinerary: {
        destination,
        startDate,
        endDate,
        numberOfDays,
        flightDetails: flightData?.flights?.[0],
        hotelDetails: hotelData?.hotels?.[0],
        dayByDay: Array.from({ length: numberOfDays }, (_, i) => i + 1).map((day) => {
          const currentDate = new Date(start)
          currentDate.setDate(start.getDate() + day - 1)
          return {
            day,
            date: currentDate.toISOString().split("T")[0],
          }
        }),
      },
    }
  },
})

// Helper function to format dates
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}
