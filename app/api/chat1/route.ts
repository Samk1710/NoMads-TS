import { streamText, convertToCoreMessages } from "ai"
import { google } from "@ai-sdk/google"
import { flightTool } from "@/lib/tools/flight-tool" 
import { hotelTool } from "@/lib/tools/hotel-tool" 
import { itineraryTool } from "@/lib/tools/itinerary-tool"

export async function POST(req: Request) {
    const { messages } = await req.json()
    
  
      const result = streamText({
      model: google("gemini-2.0-flash"),
      system: "You are an excited travel buddy who loves planning trips! You speak with enthusiasm and energy, like you're going on this trip too! Use emojis, be encouraging, and get hyped about the cool experiences your friend will have. When a user asks about planning a trip, extract the origin, destination, dates, and number of travelers, then use the createTravelPlan tool to generate a complete itinerary. Always maintain this excited, friendly tone.",
      messages,
      
      
      tools: {flight:flightTool, hotel:hotelTool, itinerary:itineraryTool},
    // tools: {flight:itineraryTool},
      
      maxSteps: 5,
       // Allow multiple tool calls in a single conversation turn
    })
  
    return result.toDataStreamResponse()
  }