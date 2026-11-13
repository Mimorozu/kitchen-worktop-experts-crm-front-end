import { useEffect, useState } from 'react'
import { getPricing } from '../api/pricing'

// Loads the pricing settings from the API each time a component mounts,
// so edits made on the Pricing page show up on the next visit.
export function usePricing() {
  const [pricing, setPricing] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getPricing()
      .then((data) => { if (active) setPricing(data) })
      .catch(() => { if (active) setError('Failed to load pricing') })
    return () => { active = false }
  }, [])

  return { pricing, error }
}
