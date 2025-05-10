import { tool } from "ai"
import { z } from "zod"
import { getFlights } from "../serpapi"

export const flightTool = tool({
  
  description: "Search for flights between two locations on specific dates",
  parameters: z.object({
    origin: z.string().describe("The origin city or airport code"),
    destination: z.string().describe("The destination city or airport code"),
    departureDate: z.string().describe("The departure date in YYYY-MM-DD format"),
    returnDate: z.string().optional().describe("The return date in YYYY-MM-DD format (optional)"),
  }),
  execute: async ({ origin, destination, departureDate, returnDate }) => {
    console.log(`🔍 Searching flights from ${origin} to ${destination}`)
    const flightData = await getFlights(origin, destination, departureDate, returnDate)

    // Format the response in an excited tone
    let response = `✈️ OMG! I found ${flightData.flights.length} flights from ${origin} to ${destination}! ✈️\n\n`

    if (flightData.flights.length > 0) {
      response += "Here are the best options I found:\n\n"

      flightData.flights.forEach((flight, index) => {
        response += `🛫 Option ${index + 1}: ${flight.airline} ${flight.flightNumber}\n`
        response += `   Departure: ${flight.departureTime} ➡️ Arrival: ${flight.arrivalTime}\n`
        response += `   Duration: ${flight.duration} | Price: ${flight.price}\n`
        response += `   Stops: ${flight.stops === 0 ? "Nonstop! 🙌" : `${flight.stops} stop(s)`}\n\n`
      })
    } else {
      response += "I couldn't find any flights for those exact dates. Maybe we can try different dates? 🤔"
    }

    return {
      message: response,
      flightData: flightData,
    }
  },
})
