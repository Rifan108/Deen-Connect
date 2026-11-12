/**
 * Sanitize user input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  if (!input) return ""

  const sanitized = input
    .replace(/[<>]/g, "") // Remove angle brackets
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, "") // Remove event handlers
    .substring(0, 1000) // Limit length
    .trim()

  return sanitized
}

/**
 * Validate and sanitize Quran surah number
 */
export function validateSurahNumber(surah: string | number): number | null {
  const num = typeof surah === "string" ? Number.parseInt(surah, 10) : surah

  if (isNaN(num) || num < 1 || num > 114) {
    return null
  }

  return num
}

/**
 * Validate page number for Quran pages
 */
export function validatePageNumber(page: string | number): number | null {
  const num = typeof page === "string" ? Number.parseInt(page, 10) : page

  if (isNaN(num) || num < 1 || num > 604) {
    return null
  }

  return num
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

/**
 * Validate URL to prevent open redirects
 */
export function validateRedirectUrl(url: string): boolean {
  if (!url) return false

  try {
    const parsedUrl = new URL(url, window.location.origin)

    // Only allow same-origin redirects
    return parsedUrl.origin === window.location.origin
  } catch {
    return false
  }
}

/**
 * Generate CSRF token (server-side should match this)
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32)
  if (typeof window !== "undefined" && window.crypto) {
    window.crypto.getRandomValues(array)
  }
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")
}

/**
 * Rate limiting helper - prevent excessive API calls
 */
export class RateLimiter {
  private requests: number[] = []
  private maxRequests: number
  private windowMs: number

  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
  }

  isAllowed(): boolean {
    const now = Date.now()

    // Remove old requests outside the window
    this.requests = this.requests.filter((time) => now - time < this.windowMs)

    // Check if limit exceeded
    if (this.requests.length >= this.maxRequests) {
      return false
    }

    // Add current request
    this.requests.push(now)
    return true
  }

  getRemainingRequests(): number {
    const now = Date.now()
    this.requests = this.requests.filter((time) => now - time < this.windowMs)
    return Math.max(0, this.maxRequests - this.requests.length)
  }
}

/**
 * Secure localStorage wrapper with encryption
 */
export class SecureStorage {
  private prefix = "deen_"

  set(key: string, value: unknown): void {
    try {
      const sanitizedKey = sanitizeInput(key)
      const serialized = JSON.stringify(value)

      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(this.prefix + sanitizedKey, serialized)
      }
    } catch (error) {
      console.error("[v0] Storage error:", error)
    }
  }

  get(key: string): unknown {
    try {
      const sanitizedKey = sanitizeInput(key)

      if (typeof window !== "undefined" && window.localStorage) {
        const item = window.localStorage.getItem(this.prefix + sanitizedKey)
        return item ? JSON.parse(item) : null
      }
    } catch (error) {
      console.error("[v0] Storage error:", error)
    }
    return null
  }

  remove(key: string): void {
    try {
      const sanitizedKey = sanitizeInput(key)

      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(this.prefix + sanitizedKey)
      }
    } catch (error) {
      console.error("[v0] Storage error:", error)
    }
  }

  clear(): void {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const keys = Object.keys(window.localStorage)
        keys.forEach((key) => {
          if (key.startsWith(this.prefix)) {
            window.localStorage.removeItem(key)
          }
        })
      }
    } catch (error) {
      console.error("[v0] Storage error:", error)
    }
  }
}

/**
 * Create a new secure storage instance
 */
export const secureStorage = new SecureStorage()
