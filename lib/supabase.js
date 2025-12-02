import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database initialization - will be called from API route
export const initializeDatabase = async () => {
  try {
    // Check if tables exist by trying to query them
    const { data: goalsData, error: goalsError } = await supabase
      .from('goals')
      .select('id')
      .limit(1)
    
    if (!goalsError) {
      console.log('Database already initialized')
      return { success: true, message: 'Database already exists' }
    }
    
    return { success: false, message: 'Tables need to be created' }
  } catch (error) {
    console.error('Database initialization check error:', error)
    return { success: false, error: error.message }
  }
}