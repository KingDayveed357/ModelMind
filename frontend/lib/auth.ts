// lib/auth.ts
import { createClient } from './supabase'

export async function signUp(email: string, password: string, fullName: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  console.log("Signup response:", data, error)

  if (error) throw error
  return data
}

export async function signIn(email: string, password: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

export async function signInWithGoogle() {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      // redirectTo: `${window.location.origin}/auth/callback`,
      redirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/callback`,
    },
  })

  if (error) throw error
  return data
}

export async function signInWithGithub() {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  if (error) throw error
  return data
}

export async function signOut() {
  const supabase = createClient()
  
  const { error } = await supabase.auth.signOut()
  if (error) throw error

  localStorage.removeItem('supabase.auth.token')
  sessionStorage.removeItem('supabase.auth.token')


  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("supabase-signout"))
  }
}

export async function resetPassword(email: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })

  if (error) throw error
  return data
}

export async function updatePassword(newPassword: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) throw error
  return data
}

export async function deleteAccount() {
  const { apiRequest } = await import('./api-client')
  
  return await apiRequest<{
    message: string
    user_id: string
    deleted_at: string
  }>('/users/delete-account', {
    method: 'DELETE',
  })
}