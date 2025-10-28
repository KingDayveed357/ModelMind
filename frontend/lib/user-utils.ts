// lib/user-utils.ts
export function getUserInitials(user: any): string {
  if (!user) return "US"
  
  // Try to get from user_metadata first, then fallback to email
  const fullName = user.user_metadata?.full_name || user.user_metadata?.name || ""
  const email = user.email || ""
  
  if (fullName) {
    return fullName
      .split(' ')
      .map((name: string) => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
  
  // Fallback to first two letters of email username
  if (email) {
    return email
      .split('@')[0]
      .slice(0, 2)
      .toUpperCase()
  }
  
  return "US"
}

export function getUserDisplayName(user: any): string {
  if (!user) return "User"
  
  return user.user_metadata?.full_name || user.user_metadata?.name || user.email || "User"
}