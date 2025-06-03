import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function TestConnection() {
  const [connectionStatus, setConnectionStatus] = useState('Testing connection...')
  const [sampleData, setSampleData] = useState<any[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function testConnection() {
      try {
        const { data, error } = await supabase
          .from('prompts')
          .select('*')
          .limit(1)
        
        if (error) throw error
        
        setSampleData(data)
        setConnectionStatus('✅ Connected to Supabase successfully!')
      } catch (err: any) {
        setError(err.message)
        setConnectionStatus('❌ Connection failed')
        console.error('Connection error:', err)
      }
    }

    testConnection()
  }, [])

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Supabase Connection Test</h1>
      <div style={{ 
        padding: '1rem', 
        margin: '1rem 0', 
        backgroundColor: error ? '#ffebee' : '#e8f5e9',
        borderRadius: '4px'
      }}>
        <p>{connectionStatus}</p>
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      </div>
      
      {sampleData && (
        <div>
          <h3>Sample Data:</h3>
          <pre style={{ 
            padding: '1rem', 
            backgroundColor: '#f5f5f5',
            borderRadius: '4px',
            overflowX: 'auto'
          }}>
            {JSON.stringify(sampleData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
