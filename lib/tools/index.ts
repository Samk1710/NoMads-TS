import { flightTool } from "./flight-tool"
import { hotelTool } from "./hotel-tool"
import { activityTool } from "./activity-tool"
import { itineraryTool } from "./itinerary-tool"

export const travelTools = {
  searchFlights: flightTool,
  searchHotels: hotelTool,
  searchActivities: activityTool,
  createItinerary: itineraryTool,
}

export { flightTool, hotelTool, activityTool, itineraryTool }
