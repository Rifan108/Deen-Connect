"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import {
  Compass,
  MapPin,
  Navigation,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  Smartphone,
  ShieldCheck,
  Info,
  Loader2,
  Globe,
} from "lucide-react"
import { useLocation } from "@/lib/location-context"
import {
  calculateQibla,
  calculateDistanceToKaaba,
  getCompassDirection,
  KAABA_COORDINATES,
} from "@/lib/location"
import { LocationSelectorDialog } from "@/components/location-selector-dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function Qibla() {
  const {
    coords,
    locationDetails,
    status,
    accuracy,
    method,
    isDetecting,
    errorMessage,
    requestGpsLocation,
    detectIpLocation,
  } = useLocation()

  // Mathematical Qibla Bearing (0–360°)
  const qiblaBearing = useMemo(() => {
    if (!coords) return 0
    return calculateQibla(coords.latitude, coords.longitude)
  }, [coords])

  const distanceToKaaba = useMemo(() => {
    if (!coords) return 0
    return Math.round(calculateDistanceToKaaba(coords.latitude, coords.longitude))
  }, [coords])

  // Device orientation / compass sensor states
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null)
  const [sensorSupported, setSensorSupported] = useState<boolean | null>(null)
  const [permissionState, setPermissionState] = useState<"default" | "granted" | "denied">("default")
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false)

  // Relative angle to face Kaaba = (qiblaBearing - deviceHeading)
  const relativeAngle = useMemo(() => {
    if (deviceHeading === null) return null
    return (qiblaBearing - deviceHeading + 360) % 360
  }, [qiblaBearing, deviceHeading])

  // Is device currently pointing within ±4 degrees of Qibla?
  const isAligned = useMemo(() => {
    if (relativeAngle === null) return false
    return relativeAngle <= 4 || relativeAngle >= 356
  }, [relativeAngle])

  // Haptic feedback when aligned
  useEffect(() => {
    if (isAligned && typeof window !== "undefined" && navigator.vibrate) {
      navigator.vibrate([40, 30, 40])
    }
  }, [isAligned])

  // Handle sensor listener
  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    let heading: number | null = null

    // iOS WebKit compass heading (magnetic or true)
    if ((event as any).webkitCompassHeading !== undefined) {
      heading = (event as any).webkitCompassHeading
    } else if (event.alpha !== null) {
      // Android / Chrome: alpha measures rotation around z-axis
      // If absolute is available, alpha 0 is North
      heading = (360 - event.alpha) % 360
    }

    if (heading !== null && !isNaN(heading)) {
      setDeviceHeading(Math.round(heading))
      setSensorSupported(true)
    }
  }, [])

  // Start compass sensor
  const enableCompassSensor = async () => {
    if (typeof window === "undefined") return

    // iOS 13+ requires explicit permission request
    if (
      typeof (DeviceOrientationEvent as any) !== "undefined" &&
      typeof (DeviceOrientationEvent as any).requestPermission === "function"
    ) {
      try {
        const response = await (DeviceOrientationEvent as any).requestPermission()
        if (response === "granted") {
          setPermissionState("granted")
          setSensorSupported(true)
          window.addEventListener("deviceorientation", handleOrientation, true)
        } else {
          setPermissionState("denied")
          setSensorSupported(false)
        }
      } catch (e) {
        console.warn("Sensor permission request failed", e)
        setPermissionState("denied")
        setSensorSupported(false)
      }
      return
    }

    // Modern browsers with absolute orientation
    if ("ondeviceorientationabsolute" in window) {
      window.addEventListener("deviceorientationabsolute", handleOrientation as any, true)
      setSensorSupported(true)
      setPermissionState("granted")
    } else if ("ondeviceorientation" in window) {
      window.addEventListener("deviceorientation", handleOrientation, true)
      setSensorSupported(true)
      setPermissionState("granted")
    } else {
      setSensorSupported(false)
    }
  }

  // Attempt initial sensor attachment
  useEffect(() => {
    if (typeof window === "undefined") return

    // Only auto-attach if permission is not required (e.g. Android/Chrome)
    if (
      typeof (DeviceOrientationEvent as any) !== "undefined" &&
      typeof (DeviceOrientationEvent as any).requestPermission !== "function"
    ) {
      enableCompassSensor()
    }

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation)
      window.removeEventListener("deviceorientationabsolute", handleOrientation as any)
    }
  }, [handleOrientation])

  return (
    <div className="space-y-6">
      {/* 1. Location Bar & Active Position */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-card border border-border/80 shadow-xs">
        <div className="flex items-center gap-3">
          <LocationSelectorDialog>
            <button
              type="button"
              className="group flex items-center gap-3 text-left p-1 rounded-2xl hover:bg-muted/50 transition"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#123D32]/10 dark:bg-[#C8A96B]/10 border border-[#C8A96B]/30 flex items-center justify-center text-[#123D32] dark:text-[#C8A96B] shrink-0 group-hover:scale-105 transition-transform">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-serif text-base font-medium text-foreground">
                    {locationDetails?.city || "Set Your Location"}
                  </span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-muted text-muted-foreground group-hover:border group-hover:border-[#C8A96B]/40 transition">
                    Change
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-1">
                  {coords
                    ? `${coords.latitude.toFixed(4)}°N, ${coords.longitude.toFixed(4)}°E • Distance: ${distanceToKaaba.toLocaleString()} km`
                    : "Coordinates required for exact spherical bearing"}
                </p>
              </div>
            </button>
          </LocationSelectorDialog>
        </div>

        {/* Sensor Status / Activation */}
        <div className="flex items-center gap-2">
          {sensorSupported === false ? (
            <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-muted text-muted-foreground border border-border">
              Static Direction Mode (No Sensor)
            </span>
          ) : deviceHeading !== null ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Magnetometer Active
            </span>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={enableCompassSensor}
              className="rounded-full text-xs gap-1.5 border-[#C8A96B]/40 text-foreground hover:bg-[#C8A96B]/10"
            >
              <Smartphone className="w-3.5 h-3.5 text-[#C8A96B]" />
              Enable Device Compass
            </Button>
          )}
        </div>
      </div>

      {/* Location Required Prompt */}
      {!coords && (
        <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h4 className="font-serif text-lg font-medium">Verified Location Required</h4>
          </div>
          <p className="text-xs leading-relaxed max-w-xl">
            The Qibla bearing is computed using spherical great-circle trigonometry directly to the Holy Kaaba (21.4225° N, 39.8262° E). Please enable GPS, detect via network, or select your city to get an accurate bearing.
          </p>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-xs">
              <span className="font-medium">Notice:</span> {errorMessage}
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-1">
            <Button
              size="sm"
              disabled={isDetecting}
              onClick={() => requestGpsLocation(true)}
              className="bg-[#123D32] hover:bg-[#174C3D] text-[#F7F5EF] rounded-full text-xs font-semibold gap-1.5"
            >
              {isDetecting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Detecting Coordinates...
                </>
              ) : (
                <>
                  <Navigation className="w-3.5 h-3.5" />
                  Detect Exact GPS
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={isDetecting}
              onClick={() => detectIpLocation()}
              className="rounded-full text-xs border-amber-600/30 gap-1.5"
            >
              <Globe className="w-3.5 h-3.5 text-[#C8A96B]" />
              Detect via Network
            </Button>
            <LocationSelectorDialog>
              <Button variant="outline" size="sm" className="rounded-full text-xs border-amber-600/30">
                Search City
              </Button>
            </LocationSelectorDialog>
          </div>
        </div>
      )}

      {/* 2. Main Compass Interactive Display */}
      {coords && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Visual Compass Dial */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center py-6">
            <div className="relative w-72 h-72 sm:w-88 sm:h-88 flex items-center justify-center">
              {/* Outer Azimuth Degree Ring */}
              <div
                className="absolute inset-0 rounded-full border-2 border-border/80 transition-transform duration-300 shadow-lg bg-card/60"
                style={{
                  transform: deviceHeading !== null ? `rotate(${-deviceHeading}deg)` : "rotate(0deg)",
                }}
              >
                {/* Cardinal Marks */}
                <span className="absolute top-2 left-1/2 -translate-x-1/2 font-mono text-xs font-bold text-rose-500">
                  N
                </span>
                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 font-mono text-xs font-bold text-muted-foreground">
                  S
                </span>
                <span className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-muted-foreground">
                  E
                </span>
                <span className="absolute left-2 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-muted-foreground">
                  W
                </span>

                {/* Concentric Calibration Ticks */}
                <div className="absolute inset-4 rounded-full border border-dashed border-border/60" />
                <div className="absolute inset-10 rounded-full border border-border/40" />
              </div>

              {/* Kaaba Direction Needle */}
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-500 ease-out"
                style={{
                  transform:
                    deviceHeading !== null
                      ? `rotate(${relativeAngle}deg)`
                      : `rotate(${qiblaBearing}deg)`,
                }}
              >
                {/* Arrow pointing to Kaaba */}
                <div className="relative w-1.5 h-full flex flex-col items-center justify-between py-6">
                  {/* Top Pointer (Kaaba Indicator) */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shadow-md transition-colors ${
                        isAligned
                          ? "bg-emerald-500 text-white scale-125"
                          : "bg-[#C8A96B] text-[#101A16]"
                      }`}
                    >
                      <span className="text-[10px] font-bold">🕋</span>
                    </div>
                    <div
                      className={`w-1 h-20 rounded-full transition-colors ${
                        isAligned ? "bg-emerald-500" : "bg-[#C8A96B]"
                      }`}
                    />
                  </div>

                  {/* Opposite Tail */}
                  <div className="w-1 h-12 bg-muted-foreground/30 rounded-full" />
                </div>
              </div>

              {/* Center Hub */}
              <div className="relative z-10 w-24 h-24 rounded-full bg-card border-2 border-border flex flex-col items-center justify-center shadow-md">
                <span className="font-mono text-xs font-bold text-foreground">
                  {deviceHeading !== null ? `${deviceHeading}°` : `${qiblaBearing.toFixed(1)}°`}
                </span>
                <span className="text-[10px] font-mono uppercase text-muted-foreground">
                  {deviceHeading !== null ? "Heading" : getCompassDirection(qiblaBearing)}
                </span>
              </div>
            </div>

            {/* Alignment Badge */}
            <div className="mt-6 text-center">
              {isAligned ? (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-700 dark:text-emerald-400 font-medium text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Aligned with the Holy Kaaba in Makkah!</span>
                </div>
              ) : deviceHeading !== null ? (
                <p className="text-xs font-mono text-muted-foreground">
                  Rotate your device{" "}
                  <span className="font-bold text-foreground">
                    {relativeAngle && relativeAngle > 180
                      ? `${(360 - relativeAngle).toFixed(0)}° Left`
                      : `${relativeAngle?.toFixed(0)}° Right`}
                  </span>{" "}
                  to face Qibla
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Static compass bearing: Face{" "}
                  <span className="font-semibold text-foreground">
                    {qiblaBearing.toFixed(1)}° ({getCompassDirection(qiblaBearing)})
                  </span>{" "}
                  from True North.
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Geographic & Scientific Verification Data */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="p-6 rounded-3xl bg-card border-border space-y-4">
              <h3 className="font-serif text-lg font-medium text-foreground flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#C8A96B]" />
                Geodesic Calculations
              </h3>

              <div className="space-y-3 divide-y divide-border/60 text-xs">
                <div className="flex justify-between items-center pt-2">
                  <span className="text-muted-foreground">Qibla True Bearing</span>
                  <span className="font-mono font-semibold text-foreground text-sm">
                    {qiblaBearing.toFixed(2)}° ({getCompassDirection(qiblaBearing)})
                  </span>
                </div>

                <div className="flex justify-between items-center pt-3">
                  <span className="text-muted-foreground">Straight-Line Distance</span>
                  <span className="font-mono font-medium text-foreground">
                    {distanceToKaaba.toLocaleString()} km
                  </span>
                </div>

                <div className="flex justify-between items-center pt-3">
                  <span className="text-muted-foreground">Target Sanctuary</span>
                  <span className="font-serif font-medium text-foreground">
                    Al-Masjid Al-Haram, Makkah
                  </span>
                </div>

                <div className="flex justify-between items-center pt-3">
                  <span className="text-muted-foreground">Kaaba Coordinates</span>
                  <span className="font-mono text-muted-foreground">
                    {KAABA_COORDINATES.latitude}°N, {KAABA_COORDINATES.longitude}°E
                  </span>
                </div>

                <div className="flex justify-between items-center pt-3">
                  <span className="text-muted-foreground">Your Coordinates</span>
                  <span className="font-mono text-muted-foreground">
                    {coords.latitude.toFixed(4)}°N, {coords.longitude.toFixed(4)}°E
                  </span>
                </div>
              </div>
            </Card>

            {/* Calibration & Sensor Notes */}
            <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 text-xs text-muted-foreground space-y-1.5 leading-relaxed">
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <Info className="w-3.5 h-3.5 text-[#C8A96B]" />
                <span>Compass Accuracy & Calibration</span>
              </div>
              <p>
                Hold your device flat like a plate. If the heading drifts, wave the phone in a figure-8 motion away from metal objects, laptop hinges, or magnetic phone cases.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
