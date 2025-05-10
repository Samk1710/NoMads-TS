// Helper function to make SerpAPI requests
async function fetchFromSerpApi(params: Record<string, string>) {
  const apiKey = process.env.SERPAPI_API_KEY
  if (!apiKey) {
    throw new Error("SERPAPI_API_KEY is not defined")
  }

  const url = new URL("https://serpapi.com/search")
  url.searchParams.append("api_key", apiKey)

  // Add all params to the URL
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value)
  })

  try {
    const response = await fetch(url.toString())
    if (!response.ok) {
      throw new Error(`SerpAPI request failed with status ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error("Error fetching from SerpAPI:", error)
    throw error
  }
}

// Get flights information
export async function getFlights(origin: string, destination: string, departureDate: string, returnDate?: string) {
  try {
    const params: Record<string, string> = {
      engine: "google_flights",
      departure_id: origin,
      arrival_id: destination,
      outbound_date: departureDate,
    }

    if (returnDate) {
      params.return_date = returnDate
    }

    const data = await fetchFromSerpApi(params)

    // Process and return relevant flight information
    const flights =
      data.flights?.slice(0, 5).map((flight: any) => ({
        airline: flight.airline,
        flightNumber: flight.flight_number,
        departureTime: flight.departure_time,
        arrivalTime: flight.arrival_time,
        duration: flight.duration,
        price: flight.price,
        stops: flight.stops,
      })) || []

    return {
      origin,
      destination,
      departureDate,
      returnDate,
      flights,
      message:
        flights.length > 0
          ? `Found ${flights.length} flights from ${origin} to ${destination}`
          : `No flights found from ${origin} to ${destination}`,
    }
  } catch (error) {
    console.error("Error getting flights:", error)
    return {
      origin,
      destination,
      departureDate,
      returnDate,
      flights: [],
      error: "Failed to retrieve flight information",
    }
  }
}

// Get hotels information
export async function getHotels(location: string, checkIn: string, checkOut: string, guests = 2) {
  try {
    const params: Record<string, string> = {
      engine: "google_hotels",
      q: `hotels in ${location}`,
      check_in_date: checkIn,
      check_out_date: checkOut,
      num_adults: guests.toString(),
    }

    const data = await fetchFromSerpApi(params)

    // Process and return relevant hotel information
    const hotels =
      data.hotels?.slice(0, 5).map((hotel: any) => ({
        name: hotel.name,
        address: hotel.address,
        rating: hotel.rating,
        reviews: hotel.reviews,
        price: hotel.price,
        description: hotel.description,
        amenities: hotel.amenities,
        images: hotel.images?.slice(0, 2) || [],
      })) || []

    return {
      location,
      checkIn,
      checkOut,
      guests,
      hotels,
      message: hotels.length > 0 ? `Found ${hotels.length} hotels in ${location}` : `No hotels found in ${location}`,
    }
  } catch (error) {
    console.error("Error getting hotels:", error)
    return {
      location,
      checkIn,
      checkOut,
      guests,
      hotels: [],
      error: "Failed to retrieve hotel information",
    }
  }
}

// Get location information
export async function getLocationInfo(location: string) {
  try {
    const params: Record<string, string> = {
      engine: "google",
      q: `${location} travel information`,
    }

    const data = await fetchFromSerpApi(params)

    // Extract knowledge graph if available
    const knowledgeGraph = data.knowledge_graph || {}

    // Extract organic results
    const organicResults = (data.organic_results || []).slice(0, 5).map((result: any) => ({
      title: result.title,
      link: result.link,
      snippet: result.snippet,
    }))

    return {
      location,
      title: knowledgeGraph.title || location,
      description: knowledgeGraph.description || "",
      type: knowledgeGraph.type || "",
      weather: knowledgeGraph.weather || "",
      localTime: knowledgeGraph.local_time || "",
      currency: knowledgeGraph.currency || "",
      language: knowledgeGraph.language || "",
      organicResults,
      message: `Retrieved information about ${location}`,
    }
  } catch (error) {
    console.error("Error getting location info:", error)
    return {
      location,
      organicResults: [],
      error: "Failed to retrieve location information",
    }
  }
}

// Get activities information
export async function getActivities(location: string, category?: string) {
  try {
    const query = category ? `${category} activities in ${location}` : `things to do in ${location}`

    const params: Record<string, string> = {
      engine: "google",
      q: query,
    }

    const data = await fetchFromSerpApi(params)

    // Extract local results if available (these are usually attractions)
    const localResults = (data.local_results || []).slice(0, 8).map((result: any) => ({
      title: result.title,
      address: result.address,
      rating: result.rating,
      reviews: result.reviews,
      description: result.description,
      hours: result.hours,
      phone: result.phone,
      website: result.website,
      category: result.category,
    }))

    // Extract organic results as backup
    const organicResults = (data.organic_results || []).slice(0, 5).map((result: any) => ({
      title: result.title,
      link: result.link,
      snippet: result.snippet,
    }))

    const activities = localResults.length > 0 ? localResults : organicResults

    return {
      location,
      category: category || "general",
      activities,
      message:
        activities.length > 0
          ? `Found ${activities.length} activities in ${location}`
          : `No activities found in ${location}`,
    }
  } catch (error) {
    console.error("Error getting activities:", error)
    return {
      location,
      category: category || "general",
      activities: [],
      error: "Failed to retrieve activities information",
    }
  }
}
