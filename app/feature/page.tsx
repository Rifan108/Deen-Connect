import { Suspense } from "react"
import FeatureContent from "@/components/feature-content"

export default function FeaturePage() {
  return (
    <Suspense fallback={null}>
      <FeatureContent />
    </Suspense>
  )
}
