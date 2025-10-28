// components/api-caller.tsx
'use client'

import { useAuth } from '@/hooks/use-auth'

export function ApiCaller() {
  const { user, authenticatedFetch, getAccessToken } = useAuth()

  const callFastAPI = async () => {
    try {
      const response = await authenticatedFetch('http://localhost:8000/api/protected')
      
      if (response.ok) {
        const data = await response.json()
        console.log('API response:', data)
      }
    } catch (error) {
      console.error('API call failed:', error)
    }
  }

  return (
    <button onClick={callFastAPI} disabled={!user}>
      Call FastAPI Backend
    </button>
  )
}