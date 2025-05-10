"use client"
import { useChat } from "@ai-sdk/react"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({ api: "/api/chat1" })

  return (
    <div className="flex flex-col h-screen bg-black p-4 md:p-8 text-white">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-3xl font-bold text-white">No Mads</h1>
        <p className="text-gray-400">Your excited friend for planning amazing trips!</p>
      </div>

      <div className="flex-1 overflow-hidden rounded-xl border border-gray-800 bg-gray-900 shadow-lg flex flex-col">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="rounded-full bg-gray-800 p-4 mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-white"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-200">Ready for an adventure?</h3>
                <p className="text-gray-400 mt-2 max-w-md">
                  Tell me where you want to go, when, and for how long. I'll create an amazing itinerary for you!
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex w-full items-start gap-2 rounded-lg p-4",
                    message.role === "user" ? "ml-auto bg-gray-800 text-white" : "bg-gray-700 text-white",
                  )}
                >
                  <div className="flex-1">
                    {message.parts ? (
                      <div className="space-y-3">
                        {message.parts.map((part, index) => {
                          if (part.type === "text") {
                            return (
                              <div key={index} className="whitespace-pre-wrap">
                                {part.text}
                              </div>
                            )
                          } else if (part.type === "tool_call") {
                            return (
                              <Card key={index} className="p-3 bg-gray-800 border-gray-700 text-sm">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="outline" className="bg-gray-900 text-gray-300">
                                    Tool Call
                                  </Badge>
                                  <span className="font-semibold text-gray-300">{part.tool.name}</span>
                                </div>

                                <div className="mb-2">
                                  <div className="text-xs text-gray-400 mb-1">Parameters:</div>
                                  <pre className="text-xs bg-gray-900 p-2 rounded overflow-x-auto">
                                    {JSON.stringify(part.tool.parameters, null, 2)}
                                  </pre>
                                </div>

                                {part.tool.result && (
                                  <div>
                                    <div className="text-xs text-gray-400 mb-1">Result:</div>
                                    <pre className="text-xs bg-gray-900 p-2 rounded overflow-x-auto">
                                      {JSON.stringify(part.tool.result, null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </Card>
                            )
                          } else if (part.type === "reasoning") {
                            return (
                              <Card key={index} className="p-3 bg-gray-800 border-gray-700 text-sm">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="outline" className="bg-gray-900 text-gray-300">
                                    Reasoning
                                  </Badge>
                                </div>
                                <div className="text-xs text-gray-300 italic">
                                  {part.details.map((detail, i) =>
                                    detail.type === "text" ? <div key={i}>{detail.text}</div> : null,
                                  )}
                                </div>
                              </Card>
                            )
                          }
                          return null
                        })}
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="border-t border-gray-800 p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="I want to go to Paris from New York for 5 days starting June 15th..."
              className="flex-1 bg-gray-800 border-gray-700 text-white focus-visible:ring-gray-600"
            />
            <Button type="submit" disabled={isLoading || !input.trim()} className="bg-gray-700 hover:bg-gray-600">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
