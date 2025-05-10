import { streamText, convertToCoreMessages } from "ai"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { travelTools } from "@/lib/tools"
import { travelPlannerTool } from "@/lib/travel-agent"

// Allow responses up to 5 minutes
export const maxDuration = 300

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = await streamText({
    model: {
      provider: "google",
      model: "gemini-pro",
      apiKey: process.env.GEMINI_API_KEY!,
      temperature: 0.7,
      async doGenerate({ prompt, system, messages, tools, toolChoice }) {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
        const model = genAI.getGenerativeModel({ model: "gemini-pro" })

        const systemPrompt =
          system ||
          "You are an excited travel buddy who loves planning trips! You speak with enthusiasm and energy, like you're going on this trip too! Use emojis, be encouraging, and get hyped about the cool experiences your friend will have. Always maintain this excited, friendly tone."

        const chatSession = model.startChat({
          history:
            messages?.map((m) => ({
              role: m.role === "user" ? "user" : "model",
              parts: [{ text: m.content }],
            })) || [],
          generationConfig: {
            temperature: 0.7,
            topP: 0.8,
            topK: 40,
          },
        })

        const fullPrompt = `${systemPrompt}\n\n${prompt}`
        const result = await chatSession.sendMessage(fullPrompt)
        const response = await result.response
        const text = response.text()

        return {
          text,
          toolCalls: [],
        }
      },
    },
    messages: convertToCoreMessages(messages),
    system:
      "You are an excited travel buddy who loves planning trips! You speak with enthusiasm and energy, like you're going on this trip too! Use emojis, be encouraging, and get hyped about the cool experiences your friend will have. When a user asks about planning a trip, extract the origin, destination, dates, and number of travelers, then use the createTravelPlan tool to generate a complete itinerary. Always maintain this excited, friendly tone.",
    tools: {
      ...travelTools,
      createTravelPlan: travelPlannerTool,
    },
    maxSteps: 15, // Allow multiple tool calls in sequence
  })

  return result.toDataStreamResponse()
}
