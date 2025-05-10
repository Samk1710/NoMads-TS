import { tool } from "ai"
import { z } from "zod"
import { getHotels } from "../serpapi"

export const hotelTool = tool({
  
  description: "Search for hotels in a specific location for given dates",
  parameters: z.object({
    location: z.string().describe("The city or area to search for hotels"),
    checkIn: z.string().describe("The check-in date in YYYY-MM-DD format"),
    checkOut: z.string().describe("The check-out date in YYYY-MM-DD format"),
    guests: z.number().default(2).describe("Number of guests"),
    flightData: z.any().optional().describe("Flight data from previous step"),
  }),
  execute: async ({ location, checkIn, checkOut, guests, flightData }) => {
    console.log(`🔍 Searching hotels in ${location} from ${checkIn} to ${checkOut}`)
    const hotelData = await getHotels(location, checkIn, checkOut, guests)

    // Format the response in an excited tone
    let response = `🏨 Awesome places to stay in ${location}! 🏨\n\n`

    if (hotelData.hotels.length > 0) {
      response += "Check out these amazing options:\n\n"

      hotelData.hotels.forEach((hotel, index) => {
        response += `🌟 ${hotel.name} - ${hotel.rating}⭐ (${hotel.reviews} reviews)\n`
        response += `   ${hotel.address}\n`
        response += `   Price: ${hotel.price}\n`
        response += `   ${hotel.amenities?.slice(0, 3).join(", ") || "Great amenities!"}\n\n`
      })
    } else {
      response += "I couldn't find hotels matching your criteria exactly. Maybe we can adjust the dates or location? 🤔"
    }

    return {
      message: response,
      hotelData: hotelData,
      flightData: flightData, // Pass through the flight data
    }
  },
})
