import { streamText, convertToCoreMessages } from "ai"
import { google } from "@ai-sdk/google"
import { flightTool } from "@/lib/tools/flight-tool"  

export async function POST(req: Request) {
    const { messages } = await req.json()
    
  
      const result = streamText({
      model: google("gemini-2.0-flash"),
      system: "You are a helpful AI agent",
      messages,
      
      
      tools: {flight:flightTool},
      
      maxSteps: 5,
       // Allow multiple tool calls in a single conversation turn
    })
  
    return result.toDataStreamResponse()
  }