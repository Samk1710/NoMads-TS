"use client"
import { useChat } from "@ai-sdk/react"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({api: "/api/chat"})

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-pink-50 to-indigo-50 p-4 md:p-8">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-3xl font-bold text-pink-600">No Mads</h1>
        <p className="text-gray-600">Your excited friend for planning amazing trips!</p>
      </div>

      <div className="flex-1 overflow-hidden rounded-xl border border-pink-200 bg-white shadow-lg flex flex-col">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="rounded-full bg-pink-100 p-4 mb-4">
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
                    className="text-pink-500"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-700">Ready for an adventure?</h3>
                <p className="text-gray-500 mt-2 max-w-md">
                  Tell me where you want to go, when, and for how long. I'll create an amazing itinerary for you!
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex w-full items-start gap-2 rounded-lg p-4",
                    message.role === "user" ? "ml-auto bg-pink-100 text-gray-800" : "bg-indigo-50 text-gray-800",
                  )}
                >
                  <div className="flex-1 whitespace-pre-wrap">{message.content}</div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="border-t border-pink-100 p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="I want to go to Paris from New York for 5 days starting June 15th..."
              className="flex-1 border-pink-200 focus-visible:ring-pink-500"
            />
            <Button type="submit" disabled={isLoading || !input.trim()} className="bg-pink-600 hover:bg-pink-700">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
