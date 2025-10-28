// 'use client'

// import { createContext, useContext, useEffect, useState } from 'react'
// import { supabase } from '@/lib/supabase'

// const AuthContext = createContext(null)

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null)

//   useEffect(() => {
//     const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
//       setUser(session?.user ?? null)
//     })

//     supabase.auth.getUser().then(({ data }) => setUser(data.user))
//     return () => listener.subscription.unsubscribe()
//   }, [])

//   return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
// }

// export const useAuth = () => useContext(AuthContext)
