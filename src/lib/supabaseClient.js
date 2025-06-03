import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase URL or Anon Key. Please check your .env.local file.')
  if (typeof window !== 'undefined') {
    console.error('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing')
    console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing')
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

// Test connection on the client side
if (typeof window !== 'undefined') {
  supabase
    .from('prompts')
    .select('*')
    .limit(1)
    .then(({ data, error }) => {
      if (error) {
        console.error('Supabase connection error:', error)
      } else {
        console.log('Supabase connected successfully!', data ? 'Sample data loaded.' : 'No data found.')
      }
    })
}

// Helper function to execute raw SQL queries
export async function executeQuery(sql, params = []) {
  const { data, error } = await supabase.rpc('execute_sql', {
    query: sql,
    params: params
  })
  
  if (error) {
    console.error('Database query error:', error)
    throw error
  }
  
  return data
}

// Helper to fetch data from a table
export async function fetchFromTable(table, select = '*', filter = {}) {
  let query = supabase.from(table).select(select)
  
  // Apply filters if any
  Object.entries(filter).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      query = query.in(key, value)
    } else {
      query = query.eq(key, value)
    }
  })
  
  const { data, error } = await query
  
  if (error) {
    console.error(`Error fetching from ${table}:`, error)
    throw error
  }
  
  return data
}
