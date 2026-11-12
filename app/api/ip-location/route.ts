import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

interface IpLocationResponse {
  success: boolean
  coords?: {
    latitude: number
    longitude: number
  }
  locationDetails?: {
    city: string
    district?: string
    state?: string
    country: string
    displayName: string
  }
  method?: "ip"
  error?: string
}

export async function GET(request: NextRequest) {
  try {
    // Check forwarded IP headers
    const forwardedFor = request.headers.get("x-forwarded-for")
    const realIp = request.headers.get("x-real-ip")
    const clientIp = forwardedFor
      ? forwardedFor.split(",")[0].trim()
      : realIp || ""

    const isLocalOrPrivate =
      !clientIp ||
      clientIp === "127.0.0.1" ||
      clientIp === "::1" ||
      clientIp.startsWith("10.") ||
      clientIp.startsWith("192.168.") ||
      clientIp.startsWith("172.")

    // Target URL for primary IP geolocation provider (freeipapi.com)
    // If local/private, omit IP so it uses server's public outgoing IP
    const freeIpUrl = isLocalOrPrivate
      ? "https://freeipapi.com/api/json"
      : `https://freeipapi.com/api/json/${clientIp}`

    try {
      const res = await fetch(freeIpUrl, {
        signal: AbortSignal.timeout(4000),
        headers: {
          "Accept": "application/json",
          "User-Agent": "DeenConnect/1.0",
        },
      })

      if (res.ok) {
        const data = await res.json()
        const lat = parseFloat(data.latitude)
        const lon = parseFloat(data.longitude)

        if (!isNaN(lat) && !isNaN(lon) && lat !== 0 && lon !== 0) {
          const city = data.cityName || "Current Location"
          const state = data.regionName || ""
          const country = data.countryName || ""
          const parts = [city, state, country].filter(Boolean)

          return NextResponse.json<IpLocationResponse>({
            success: true,
            coords: { latitude: lat, longitude: lon },
            locationDetails: {
              city,
              district: "",
              state,
              country,
              displayName: parts.join(", "),
            },
            method: "ip",
          })
        }
      }
    } catch (primaryErr) {
      console.warn("Primary IP geolocation (freeipapi) failed:", primaryErr)
    }

    // Secondary fallback provider: ipwho.is
    const ipwhoUrl = isLocalOrPrivate
      ? "https://ipwho.is/"
      : `https://ipwho.is/${clientIp}`

    try {
      const res2 = await fetch(ipwhoUrl, {
        signal: AbortSignal.timeout(4000),
        headers: {
          "Accept": "application/json",
        },
      })

      if (res2.ok) {
        const data2 = await res2.json()
        if (data2.success !== false) {
          const lat = parseFloat(data2.latitude)
          const lon = parseFloat(data2.longitude)

          if (!isNaN(lat) && !isNaN(lon)) {
            const city = data2.city || "Current Location"
            const state = data2.region || ""
            const country = data2.country || ""
            const parts = [city, state, country].filter(Boolean)

            return NextResponse.json<IpLocationResponse>({
              success: true,
              coords: { latitude: lat, longitude: lon },
              locationDetails: {
                city,
                district: "",
                state,
                country,
                displayName: parts.join(", "),
              },
              method: "ip",
            })
          }
        }
      }
    } catch (secondaryErr) {
      console.warn("Secondary IP geolocation (ipwho.is) failed:", secondaryErr)
    }

    return NextResponse.json<IpLocationResponse>(
      {
        success: false,
        error: "Unable to detect network IP location. Please search for your city manually.",
      },
      { status: 502 }
    )
  } catch (error: any) {
    return NextResponse.json<IpLocationResponse>(
      {
        success: false,
        error: error.message || "Internal server error detecting location",
      },
      { status: 500 }
    )
  }
}

