import { apiRequest } from '@/lib/api-client'
import { createClient } from '@/lib/supabase'

class UserDatasets {
  private async getUserId(): Promise<string> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')
    return user.id
  }

  async getDatasetsCount(): Promise<number> {
    const supabase = createClient()
    const userId = await this.getUserId()
    
    const { count, error } = await supabase
      .from('datasets')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
    
    if (error) throw error
    return count || 0
  }
}

export const userDatasets = new UserDatasets()