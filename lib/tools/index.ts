import { flightTool } from "./flight-tool"
import { hotelTool } from "./hotel-tool"
import { itineraryTool } from "./itinerary-tool"

export const travelTools = {
  searchFlights: flightTool,
  searchHotels: hotelTool,
  createItinerary: itineraryTool,
}

export { flightTool, hotelTool, itineraryTool }
