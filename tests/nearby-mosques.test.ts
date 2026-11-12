import { describe, it } from "node:test"
import assert from "node:assert/strict"

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000"

const TEST_CITIES = [
  { name: "Mysuru", lat: 12.2958, lng: 76.6394, radius: 5000 },
  { name: "Bengaluru", lat: 12.9716, lng: 77.5946, radius: 5000 },
  { name: "Mumbai", lat: 19.076, lng: 72.8777, radius: 5000 },
  { name: "Delhi", lat: 28.6139, lng: 77.209, radius: 5000 },
  { name: "Makkah", lat: 21.4225, lng: 39.8262, radius: 5000 },
]

describe("Nearby Mosques Live API Verification", () => {
  for (const city of TEST_CITIES) {
    it(
      `should return verified mosques for ${city.name} sorted by distance without non-Muslim sites`,
      { timeout: 120000 },
      async () => {
      const url = `${BASE_URL}/api/nearby-mosques?lat=${city.lat}&lng=${city.lng}&radius=${city.radius}`
      const res = await fetch(url)

      assert.strictEqual(res.status, 200, `Expected 200 OK from ${url}`)
      const data = await res.json()

      assert.strictEqual(data.success, true, "Response should have success: true")
      assert.ok(Array.isArray(data.data), "data.data should be an array")
      assert.ok(data.diagnostics, "data.diagnostics should be present")
      assert.strictEqual(data.diagnostics.httpStatus, 200, "Diagnostic HTTP status should be 200")

      console.log(`✓ ${city.name}: Found ${data.data.length} mosques (Endpoint: ${data.diagnostics.endpoint}, Response time: ${data.diagnostics.responseTimeMs}ms)`)

      // Check distance sorting
      for (let i = 1; i < data.data.length; i++) {
        assert.ok(
          data.data[i].distance >= data.data[i - 1].distance,
          `Mosques should be sorted ascending by distance at index ${i}`
        )
      }

      // Check fields and exclusion of temples/non-Muslim
      for (const mosque of data.data) {
        assert.ok(mosque.id, "Mosque should have id")
        assert.ok(mosque.name, "Mosque should have name")
        assert.ok(typeof mosque.lat === "number", "Mosque should have numeric lat")
        assert.ok(typeof mosque.lon === "number", "Mosque should have numeric lon")
        assert.ok(typeof mosque.distance === "number", "Mosque should have numeric distance")
        assert.ok(mosque.osmUrl, "Mosque should have valid osmUrl")

        const nameLower = mosque.name.toLowerCase()
        assert.strictEqual(nameLower.includes("temple"), false, `Should not include temple: ${mosque.name}`)
        assert.strictEqual(nameLower.includes("church"), false, `Should not include church: ${mosque.name}`)
        assert.strictEqual(nameLower.includes("mandir"), false, `Should not include mandir: ${mosque.name}`)
        assert.strictEqual(nameLower.includes("gurudwara"), false, `Should not include gurudwara: ${mosque.name}`)
      }
    })
  }
})
