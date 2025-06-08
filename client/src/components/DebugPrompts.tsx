// src/components/DebugPrompts.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseProvider'; // Use the centralized provider

interface Prompt {
  id: number;
  text: string;
  level: number;
  intensity: number;
  type: string;
  category: string;
  // Add other fields if necessary
}

function DebugPrompts() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  useEffect(() => {
    async function fetchPrompts() {
      setLoading(true);
      try {
        // Fetch total count
        const { count, error: countError } = await supabase
          .from('prompts')
          .select('*', { count: 'exact', head: true });

        if (countError) {
          throw countError;
        }
        setTotalCount(count);

        // Fetch a sample of prompts
        const { data, error: dataError } = await supabase
          .from('prompts')
          .select('id, text, level, intensity, type, category')
          .limit(10);

        if (dataError) {
          throw dataError;
        }

        if (data) {
          setPrompts(data as Prompt[]);
        }
      } catch (err: any) {
        console.error('Error fetching prompts:', err);
        setError(err.message || 'Failed to fetch prompts');
      } finally {
        setLoading(false);
      }
    }

    fetchPrompts();
  }, []);

  if (loading) {
    return <p>Loading prompts...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>Error: {error}</p>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Debug Prompts Information</h2>
      {totalCount !== null && <p>Total prompts in database: <strong>{totalCount}</strong></p>}
      {prompts.length > 0 ? (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {prompts.map((prompt) => (
            <li key={prompt.id} style={{ border: '1px solid #ccc', marginBottom: '10px', padding: '10px' }}>
              <p><strong>ID:</strong> {prompt.id}</p>
              <p><strong>Text:</strong> {prompt.text}</p>
              <p><strong>Level:</strong> {prompt.level}</p>
              <p><strong>Intensity:</strong> {prompt.intensity}</p>
              <p><strong>Type:</strong> {prompt.type}</p>
              <p><strong>Category:</strong> {prompt.category}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No prompts found or unable to fetch.</p>
      )}
    </div>
  );
}

export default DebugPrompts;
