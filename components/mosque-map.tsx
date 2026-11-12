"use client"

import React, { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

export interface MapMosque {
  id: number
  name: string
  address: string
  distance: number
  lat: number
  lon: number
}

interface MosqueMapProps {
  userCoords: { latitude: number; longitude: number }
  mosques: MapMosque[]
  selectedMosque: MapMosque | null
  onSelectMosque: (mosque: MapMosque) => void
}

export default function MosqueMap({
  userCoords,
  mosques,
  selectedMosque,
  onSelectMosque,
}: MosqueMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersLayerRef = useRef<L.LayerGroup | null>(null)

  useEffect(() => {
    if (!mapContainerRef.current) return

    // Fix default Leaflet icon paths in bundlers
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    })

    // Initialize Leaflet Map
    const map = L.map(mapContainerRef.current, {
      center: [userCoords.latitude, userCoords.longitude],
      zoom: 14,
      zoomControl: true,
      attributionControl: false,
    })

    // OpenStreetMap CartoDB Positron / OSM standard tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map)

    const markersLayer = L.layerGroup().addTo(map)
    markersLayerRef.current = markersLayer
    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [userCoords.latitude, userCoords.longitude])

  // Update markers whenever mosques or selected mosque changes
  useEffect(() => {
    const map = mapInstanceRef.current
    const layer = markersLayerRef.current
    if (!map || !layer) return

    layer.clearLayers()

    // 1. User Position Marker (Blue / Emerald Pulse)
    const userIcon = L.divIcon({
      className: "custom-user-marker",
      html: `
        <div style="
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #123D32;
          border: 3px solid #FFFFFF;
          box-shadow: 0 0 10px rgba(18,61,50,0.5);
          position: relative;
        ">
          <div style="
            position: absolute;
            inset: -6px;
            border-radius: 50%;
            background: rgba(18,61,50,0.25);
            animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
          "></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    })

    L.marker([userCoords.latitude, userCoords.longitude], { icon: userIcon })
      .bindPopup("<b>Your Current Location</b>")
      .addTo(layer)

    // 2. Mosque Markers
    mosques.forEach((m) => {
      const isSelected = selectedMosque?.id === m.id

      const mosqueIcon = L.divIcon({
        className: "custom-mosque-marker",
        html: `
          <div style="
            width: ${isSelected ? "34px" : "28px"};
            height: ${isSelected ? "34px" : "28px"};
            border-radius: 50%;
            background: ${isSelected ? "#123D32" : "#C8A96B"};
            color: #FFFFFF;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${isSelected ? "14px" : "12px"};
            border: 2px solid #FFFFFF;
            box-shadow: 0 4px 10px rgba(0,0,0,0.2);
            transition: all 0.2s;
            cursor: pointer;
          ">
            🕌
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      })

      const marker = L.marker([m.lat, m.lon], { icon: mosqueIcon }).addTo(layer)

      marker.on("click", () => {
        onSelectMosque(m)
      })

      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 13px; line-height: 1.4;">
          <b style="color: #123D32; font-size: 14px;">${m.name}</b><br/>
          <span style="color: #666; font-size: 11px;">${m.address}</span><br/>
          <span style="color: #C8A96B; font-weight: 600; font-size: 12px;">${m.distance < 1 ? `${Math.round(m.distance * 1000)} m` : `${m.distance.toFixed(1)} km`} away</span><br/>
          <a href="https://www.google.com/maps/dir/?api=1&destination=${m.lat},${m.lon}" target="_blank" style="display: inline-block; margin-top: 6px; color: #123D32; font-weight: 500; font-size: 12px; text-decoration: underline;">
            Open Directions ↗
          </a>
        </div>
      `)
    })

    // Fit map bounds or fly to selected mosque
    if (selectedMosque) {
      map.flyTo([selectedMosque.lat, selectedMosque.lon], 16, { duration: 0.8 })
    } else if (mosques.length > 0) {
      const points: [number, number][] = [
        [userCoords.latitude, userCoords.longitude],
        ...mosques.map((m) => [m.lat, m.lon] as [number, number]),
      ]
      const bounds = L.latLngBounds(points)
      map.fitBounds(bounds, { padding: [35, 35], maxZoom: 15 })
    }
  }, [mosques, selectedMosque, userCoords, onSelectMosque])

  return (
    <div className="relative w-full h-[400px] sm:h-[480px] rounded-3xl overflow-hidden border border-border shadow-sm">
      <div ref={mapContainerRef} className="w-full h-full z-10" />
      <div className="absolute bottom-2 right-3 z-20 bg-background/80 backdrop-blur-xs px-2.5 py-1 rounded-md text-[10px] text-muted-foreground border border-border">
        OpenStreetMap Data • Leaflet
      </div>
    </div>
  )
}

