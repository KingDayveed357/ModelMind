// components/auth-test.tsx
'use client'

import { useAuth } from '@/hooks/use-auth'
import { useState } from 'react'

interface TestResult {
  endpoint: string
  status: number
  data: any
  error?: string
}

export function AuthTest() {
  const { authenticatedFetch, user } = useAuth()
  const [results, setResults] = useState<TestResult[]>([])
  const [testing, setTesting] = useState(false)

  const runTests = async () => {
    if (!user) {
      alert('Please sign in first!')
      return
    }

    setTesting(true)
    setResults([])

    const endpoints = [
      { name: 'Public', url: 'http://localhost:8000/test/public' },
      { name: 'Protected', url: 'http://localhost:8000/test/protected' },
      { name: 'Token Info', url: 'http://localhost:8000/test/token-info' },
    ]

    for (const endpoint of endpoints) {
      try {
        const response = await authenticatedFetch(endpoint.url)
        const data = await response.json()
        
        setResults(prev => [...prev, {
          endpoint: endpoint.name,
          status: response.status,
          data: data
        }])
      } catch (error) {
        setResults(prev => [...prev, {
          endpoint: endpoint.name,
          status: 0,
          data: null,
          error: error instanceof Error ? error.message : 'Unknown error'
        }])
      }
    }

    setTesting(false)
  }

  return (
    <div className="p-6 border rounded-lg bg-white shadow-sm">
      <h2 className="text-xl font-bold mb-4">🔐 Authentication Test</h2>
      
      <button
        onClick={runTests}
        disabled={testing || !user}
        className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50 mb-4"
      >
        {testing ? 'Testing...' : 'Run Auth Tests'}
      </button>

      {!user && (
        <p className="text-yellow-600 mb-4">Please sign in to run tests</p>
      )}

      <div className="space-y-3">
        {results.map((result, index) => (
          <div key={index} className={`p-3 rounded border ${
            result.status === 200 ? 'bg-green-50 border-green-200' : 
            result.status === 401 ? 'bg-red-50 border-red-200' : 
            'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex justify-between items-center">
              <span className="font-medium">{result.endpoint}</span>
              <span className={`px-2 py-1 rounded text-xs ${
                result.status === 200 ? 'bg-green-200' : 
                result.status === 401 ? 'bg-red-200' : 'bg-yellow-200'
              }`}>
                Status: {result.status || 'Error'}
              </span>
            </div>
            
            {result.error ? (
              <p className="text-red-600 text-sm mt-1">{result.error}</p>
            ) : (
              <pre className="text-sm mt-1 overflow-x-auto">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}