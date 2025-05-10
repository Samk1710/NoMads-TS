import { z } from "zod"
import { tool } from "ai"
import { flightTool, hotelTool, activityTool, itineraryTool } from "./tools"

// This is a meta-tool that orchestrates the sequential execution of other tools
export const travelPlannerTool = tool({
  
  description:
    "Create a complete travel plan by sequentially gathering flight, hotel, activity information and creating an itinerary",
  parameters: z.object({
    origin: z.string().describe("The origin city or airport code"),
    destination: z.string().describe("The destination city or airport code"),
    startDate: z.string().describe("The start date in YYYY-MM-DD format"),
    endDate: z.string().describe("The end date in YYYY-MM-DD format"),
    travelers: z.number().default(2).describe("Number of travelers"),
  }),
  execute: async ({ origin, destination, startDate, endDate, travelers }) => {
    console.log(`🚀 Starting travel planning process for ${origin} to ${destination}`)

    // Step 1: Search for flights
    const { flightData } = await flightTool.execute({
      origin,
      destination,
      departureDate: startDate,
      returnDate: endDate,
    })

    // Step 2: Search for hotels
    const { hotelData } = await hotelTool.execute({
      location: destination,
      checkIn: startDate,
      checkOut: endDate,
      guests: travelers,
      flightData,
    })

    // Step 3: Search for activities and location info
    const { locationData, activities } = await activityTool.execute({
      location: destination,
      categories: ["attractions", "food", "outdoor", "museums", "nightlife", "shopping"],
      flightData,
      hotelData,
    })

    // Step 4: Create the itinerary
    const { message } = await itineraryTool.execute({
      destination,
      startDate,
      endDate,
      flightData,
      hotelData,
      locationData,
      activities,
    })

    return {
      message,
      summary: `Travel plan created for ${origin} to ${destination} from ${startDate} to ${endDate} for ${travelers} travelers.`,
    }
  },
})
