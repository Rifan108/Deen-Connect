"use client"

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react"
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
  RefreshCw,
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
    retryLocation,
  } = useLocation()

  // 1. Exact Great-Circle Geographic Qibla Bearing (0–360°)
  const qiblaBearing = useMemo(() => {
    if (!coords) return 0
    return calculateQibla(coords.latitude, coords.longitude)
  }, [coords])

  const distanceToKaaba = useMemo(() => {
    if (!coords) return 0
    return Math.round(calculateDistanceToKaaba(coords.latitude, coords.longitude))
  }, [coords])

  // 2. Sensor States
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null)
  const [sensorState, setSensorState] = useState<"checking" | "active" | "unsupported" | "denied">("checking")
  const [sensorAccuracy, setSensorAccuracy] = useState<number | null>(null)

  // Unwrapped smooth rotation values to prevent 360° spin jumps across North
  const [dialRotation, setDialRotation] = useState<number>(0)
  const [needleRotation, setNeedleRotation] = useState<number>(0)

  const lastHeadingRef = useRef<number | null>(null)
  const accumulatedDialRef = useRef<number>(0)
  const lastNeedleRef = useRef<number | null>(null)
  const accumulatedNeedleRef = useRef<number>(0)

  // 3. Normalized relative angle from device top to Kaaba = (qiblaBearing - deviceHeading)
  const relativeAngle = useMemo(() => {
    if (deviceHeading === null) return null
    return (((qiblaBearing - deviceHeading) % 360) + 360) % 360
  }, [qiblaBearing, deviceHeading])

  // Is device pointing within ±3.5 degrees of Qibla?
  const isAligned = useMemo(() => {
    if (relativeAngle === null) return false
    return relativeAngle <= 3.5 || relativeAngle >= 356.5
  }, [relativeAngle])

  // Haptic feedback upon alignment
  useEffect(() => {
    if (isAligned && typeof window !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate([40, 25, 40])
      } catch {}
    }
  }, [isAligned])

  // 4. Smooth angle unwrapper
  const unwrapAngle = (current: number, last: number, accumulated: number) => {
    let delta = ((current - last + 180) % 360 + 360) % 360 - 180
    return accumulated + delta
  }

  // Update unwrapped dial and needle rotations when heading or bearing changes
  useEffect(() => {
    if (deviceHeading === null) {
      // In static mode, needle points directly to calculated geographic bearing
      setDialRotation(0)
      setNeedleRotation(qiblaBearing)
      accumulatedDialRef.current = 0
      lastHeadingRef.current = null
      lastNeedleRef.current = qiblaBearing
      accumulatedNeedleRef.current = qiblaBearing
      return
    }

    // Dial rotation = -deviceHeading (so True North remains aligned with Earth North)
    const targetDial = -deviceHeading
    if (lastHeadingRef.current === null) {
      accumulatedDialRef.current = targetDial
      lastHeadingRef.current = targetDial
    } else {
      accumulatedDialRef.current = unwrapAngle(targetDial, lastHeadingRef.current, accumulatedDialRef.current)
      lastHeadingRef.current = targetDial
    }
    setDialRotation(accumulatedDialRef.current)

    // Needle rotation = relativeAngle (relative to the top of the phone screen)
    if (relativeAngle !== null) {
      if (lastNeedleRef.current === null) {
        accumulatedNeedleRef.current = relativeAngle
        lastNeedleRef.current = relativeAngle
      } else {
        accumulatedNeedleRef.current = unwrapAngle(relativeAngle, lastNeedleRef.current, accumulatedNeedleRef.current)
        lastNeedleRef.current = relativeAngle
      }
      setNeedleRotation(accumulatedNeedleRef.current)
    }
  }, [deviceHeading, qiblaBearing, relativeAngle])

  // 5. Device Orientation Listener
  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    let rawHeading: number | null = null
    let accuracyValue: number | null = null

    // A. iOS WebKit Compass Heading
    if ((event as any).webkitCompassHeading !== undefined) {
      const h = Number((event as any).webkitCompassHeading)
      if (!isNaN(h) && h >= 0 && h <= 360) {
        rawHeading = h
        accuracyValue = (event as any).webkitCompassAccuracy !== undefined
          ? Number((event as any).webkitCompassAccuracy)
          : null
      }
    }
    // B. Android / W3C Absolute Device Orientation
    else if (event.alpha !== null && !isNaN(event.alpha)) {
      // Strictly verify that event is absolute Earth reference (not relative gyroscope drift)
      const isAbsolute = event.absolute === true || (event as any).type === "deviceorientationabsolute"

      if (isAbsolute) {
        let heading = (360 - event.alpha) % 360

        // Handle screen orientation (landscape vs portrait)
        let screenAngle = 0
        if (typeof window !== "undefined") {
          screenAngle = window.screen?.orientation?.angle || (window as any).orientation || 0
        }
        heading = (heading + screenAngle) % 360
        rawHeading = heading
      }
    }

    if (rawHeading !== null && !isNaN(rawHeading)) {
      setDeviceHeading(Math.round(rawHeading))
      setSensorState("active")
      if (accuracyValue !== null) {
        setSensorAccuracy(accuracyValue >= 0 ? Math.round(accuracyValue) : null)
      }
    }
  }, [])

  // 6. Enable Device Compass
  const enableCompass = useCallback(async () => {
    if (typeof window === "undefined") return

    const win = window as any

    // iOS 13+ permission request
    if (
      typeof (DeviceOrientationEvent as any) !== "undefined" &&
      typeof (DeviceOrientationEvent as any).requestPermission === "function"
    ) {
      try {
        const response = await (DeviceOrientationEvent as any).requestPermission()
        if (response === "granted") {
          setSensorState("active")
          win.addEventListener("deviceorientation", handleOrientation, true)
        } else {
          setSensorState("denied")
        }
      } catch (err) {
        setSensorState("unsupported")
      }
      return
    }

    // Android / Desktop check
    if ("ondeviceorientationabsolute" in win) {
      win.addEventListener("deviceorientationabsolute", handleOrientation, true)
      // Check after 1.5s if actual absolute events fired
      setTimeout(() => {
        if (lastHeadingRef.current === null) {
          setSensorState("unsupported")
        }
      }, 1500)
    } else if ("ondeviceorientation" in win) {
      win.addEventListener("deviceorientation", handleOrientation, true)
      setTimeout(() => {
        if (lastHeadingRef.current === null) {
          setSensorState("unsupported")
        }
      }, 1500)
    } else {
      setSensorState("unsupported")
    }
  }, [handleOrientation])

  // Auto-attach sensor if no permission required
  useEffect(() => {
    if (typeof window === "undefined") return
    const win = window as any

    if (
      typeof (DeviceOrientationEvent as any) !== "undefined" &&
      typeof (DeviceOrientationEvent as any).requestPermission !== "function"
    ) {
      enableCompass()
    } else {
      setSensorState("checking")
    }

    return () => {
      win.removeEventListener?.("deviceorientation", handleOrientation)
      win.removeEventListener?.("deviceorientationabsolute", handleOrientation)
    }
  }, [enableCompass, handleOrientation])

  return (
    <div className="space-y-6">
      {/* 1. Verified Location & GPS Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-card border border-border/80 shadow-xs">
        <div className="flex items-center gap-3.5">
          <LocationSelectorDialog>
            <button
              type="button"
              className="group flex items-center gap-3 text-left p-1 rounded-2xl hover:bg-muted/50 transition"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#123D32]/10 dark:bg-[#C8A96B]/10 border border-[#C8A96B]/30 flex items-center justify-center text-[#123D32] dark:text-[#C8A96B] shrink-0 group-hover:scale-105 transition-transform">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-base font-medium text-foreground">
                    {locationDetails?.city || "Set Your Location"}
                  </span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-muted text-muted-foreground group-hover:border group-hover:border-[#C8A96B]/40 transition">
                    Change
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-1">
                  {coords
                    ? `${coords.latitude.toFixed(4)}°N, ${coords.longitude.toFixed(4)}°E • Kaaba Distance: ${distanceToKaaba.toLocaleString()} km`
                    : "Coordinates required for exact spherical calculation"}
                </p>
              </div>
            </button>
          </LocationSelectorDialog>
        </div>

        {/* Location & Sensor Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {coords && (
            <>
              {method !== "gps" ? (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isDetecting}
                  onClick={() => requestGpsLocation()}
                  className="rounded-full text-xs gap-1.5 border-border"
                >
                  {isDetecting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Navigation className="w-3.5 h-3.5 text-primary" />
                  )}
                  <span>Use GPS</span>
                </Button>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                  <Navigation className="w-3 h-3 fill-current" />
                  GPS Active {accuracy ? `(±${Math.round(accuracy)}m)` : ""}
                </span>
              )}

              <LocationSelectorDialog>
                <Button variant="outline" size="sm" className="rounded-full text-xs gap-1.5 border-border">
                  <MapPin className="w-3.5 h-3.5 text-[#C8A96B]" />
                  Change City
                </Button>
              </LocationSelectorDialog>
            </>
          )}

          {sensorState === "active" && deviceHeading !== null ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Magnetometer
            </span>
          ) : sensorState === "denied" ? (
            <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              Sensor Permission Denied
            </span>
          ) : sensorState === "unsupported" ? (
            <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-muted text-muted-foreground border border-border">
              Static Direction Mode
            </span>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={enableCompass}
              className="rounded-full text-xs gap-1.5 border-[#C8A96B]/40 text-foreground hover:bg-[#C8A96B]/10"
            >
              <Smartphone className="w-3.5 h-3.5 text-[#C8A96B]" />
              Enable Device Sensor
            </Button>
          )}
        </div>
      </div>

      {/* Location Required / Retry Card */}
      {!coords && (
        <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <h4 className="font-serif text-lg font-medium">Location Required for Qibla Bearing</h4>
          </div>
          <p className="text-xs leading-relaxed max-w-xl">
            The Qibla bearing is computed using great-circle spherical trigonometry directly to the Holy Kaaba ({KAABA_COORDINATES.latitude}° N, {KAABA_COORDINATES.longitude}° E). Please enable your browser GPS or select your city manually to calculate your direction.
          </p>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-xs">
              <span className="font-medium">Notice:</span> {errorMessage}
            </div>
          )}

          <div className="flex flex-wrap gap-2.5 pt-1">
            <Button
              size="sm"
              disabled={isDetecting}
              onClick={() => retryLocation()}
              className="bg-[#123D32] hover:bg-[#174C3D] text-[#F7F5EF] dark:bg-[#C8A96B] dark:text-[#101A16] rounded-full text-xs font-semibold gap-1.5"
            >
              {isDetecting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Detecting GPS...
                </>
              ) : (
                <>
                  <Navigation className="w-3.5 h-3.5" />
                  Retry GPS Location
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
              Network Location
            </Button>

            <LocationSelectorDialog>
              <Button variant="outline" size="sm" className="rounded-full text-xs border-amber-600/30">
                Search Any City Manually
              </Button>
            </LocationSelectorDialog>
          </div>
        </div>
      )}

      {/* 2. Main Compass Interactive Experience */}
      {coords && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Visual Compass Dial */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center py-6">
            <div className="relative w-72 h-72 sm:w-88 sm:h-88 flex items-center justify-center select-none">
              {/* Outer Azimuth Degree Dial (Rotates smoothly with device heading) */}
              <div
                className="absolute inset-0 rounded-full border-2 border-border/80 shadow-lg bg-card/60 transition-transform duration-200 ease-out"
                style={{
                  transform: `rotate(${dialRotation}deg)`,
                }}
              >
                {/* Cardinal Marks */}
                <span className="absolute top-2 left-1/2 -translate-x-1/2 font-mono text-xs font-bold text-rose-500">
                  N
                </span>
                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 font-mono text-xs font-bold text-muted-foreground">
                  S
                </span>
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-muted-foreground">
                  E
                </span>
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-muted-foreground">
                  W
                </span>

                {/* Degree Tick Ring */}
                {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                  <div
                    key={deg}
                    className="absolute inset-0 flex items-start justify-center pointer-events-none"
                    style={{ transform: `rotate(${deg}deg)` }}
                  >
                    <span className="w-0.5 h-2 bg-border/80 mt-1" />
                  </div>
                ))}

                {/* Concentric Guide Circles */}
                <div className="absolute inset-4 rounded-full border border-dashed border-border/50" />
                <div className="absolute inset-10 rounded-full border border-border/30" />
              </div>

              {/* Kaaba Direction Indicator Needle */}
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-200 ease-out"
                style={{
                  transform: `rotate(${needleRotation}deg)`,
                }}
              >
                <div className="relative w-2 h-full flex flex-col items-center justify-between py-5">
                  {/* Top Kaaba Sanctuary Target */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shadow-md transition-all duration-300 ${
                        isAligned
                          ? "bg-emerald-500 text-white scale-125 ring-4 ring-emerald-500/30"
                          : "bg-[#C8A96B] text-[#101A16]"
                      }`}
                    >
                      <span className="text-xs">🕋</span>
                    </div>
                    <div
                      className={`w-1 h-20 rounded-full transition-colors duration-300 ${
                        isAligned ? "bg-emerald-500" : "bg-[#C8A96B]"
                      }`}
                    />
                  </div>

                  {/* Tail Indicator */}
                  <div className="w-1 h-10 bg-muted-foreground/30 rounded-full" />
                </div>
              </div>

              {/* Central Bearing readout */}
              <div className="relative z-10 w-24 h-24 rounded-full bg-card border-2 border-border flex flex-col items-center justify-center shadow-md">
                <span className="font-mono text-xs font-bold text-foreground">
                  {deviceHeading !== null ? `${deviceHeading}°` : `${qiblaBearing.toFixed(1)}°`}
                </span>
                <span className="text-[10px] font-mono uppercase text-muted-foreground">
                  {deviceHeading !== null ? "Heading" : getCompassDirection(qiblaBearing)}
                </span>
              </div>
            </div>

            {/* Alignment / Directional Guidance Message */}
            <div className="mt-6 text-center">
              {isAligned ? (
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-700 dark:text-emerald-400 font-medium text-xs shadow-xs animate-bounce">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>You are directly facing the Holy Kaaba in Makkah!</span>
                </div>
              ) : deviceHeading !== null ? (
                <p className="text-xs font-mono text-muted-foreground">
                  Rotate phone{" "}
                  <span className="font-bold text-foreground">
                    {relativeAngle && relativeAngle > 180
                      ? `${(360 - relativeAngle).toFixed(0)}° Left`
                      : `${relativeAngle?.toFixed(0)}° Right`}
                  </span>{" "}
                  to align with Qibla ({qiblaBearing.toFixed(1)}°)
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Static Mode: Face{" "}
                  <span className="font-semibold text-foreground">
                    {qiblaBearing.toFixed(1)}° ({getCompassDirection(qiblaBearing)})
                  </span>{" "}
                  clockwise from True North.
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Geodesic Verification & Technical Specs */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="p-6 rounded-3xl bg-card border-border space-y-4 shadow-xs">
              <h3 className="font-serif text-lg font-medium text-foreground flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#C8A96B]" />
                Geodesic Calculation Audit
              </h3>

              <div className="space-y-3 divide-y divide-border/60 text-xs">
                <div className="flex justify-between items-center pt-2">
                  <span className="text-muted-foreground">Great-Circle Qibla Bearing</span>
                  <span className="font-mono font-semibold text-foreground text-sm">
                    {qiblaBearing.toFixed(2)}° ({getCompassDirection(qiblaBearing)})
                  </span>
                </div>

                <div className="flex justify-between items-center pt-3">
                  <span className="text-muted-foreground">Straight-Line Geodesic Distance</span>
                  <span className="font-mono font-medium text-foreground">
                    {distanceToKaaba.toLocaleString()} km
                  </span>
                </div>

                <div className="flex justify-between items-center pt-3">
                  <span className="text-muted-foreground">Kaaba Sanctuary Target</span>
                  <span className="font-serif font-medium text-foreground">
                    Al-Masjid Al-Haram, Makkah
                  </span>
                </div>

                <div className="flex justify-between items-center pt-3">
                  <span className="text-muted-foreground">Kaaba Coordinates</span>
                  <span className="font-mono text-muted-foreground">
                    {KAABA_COORDINATES.latitude}° N, {KAABA_COORDINATES.longitude}° E
                  </span>
                </div>

                <div className="flex justify-between items-center pt-3">
                  <span className="text-muted-foreground">Your Selected Location</span>
                  <span className="font-medium text-foreground">
                    {locationDetails?.city || "Active Point"}, {locationDetails?.country || ""}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-3">
                  <span className="text-muted-foreground">Verified Coordinates</span>
                  <span className="font-mono text-muted-foreground">
                    {coords.latitude.toFixed(4)}°N, {coords.longitude.toFixed(4)}°E
                  </span>
                </div>

                <div className="flex justify-between items-center pt-3">
                  <span className="text-muted-foreground">Location Provider</span>
                  <span className="font-mono uppercase text-[11px] text-muted-foreground">
                    {method === "gps" ? "Device Hardware GPS" : method === "ip" ? "Network Detected" : "Manual Selection"}
                  </span>
                </div>
              </div>
            </Card>

            {/* Sensor Calibration & Stability Guide */}
            <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 text-xs text-muted-foreground space-y-1.5 leading-relaxed">
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <Info className="w-3.5 h-3.5 text-[#C8A96B]" />
                <span>Compass Accuracy & Calibration</span>
              </div>
              <p>
                Hold your device flat in the palm of your hand. If compass heading appears unstable or inaccurate, wave the phone in a gentle figure-8 motion away from metal laptops, magnetic cases, and electronic interference.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
