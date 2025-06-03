-- Create prompts table
CREATE TABLE IF NOT EXISTS public.prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    text TEXT NOT NULL,
    level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 3),
    intensity INTEGER NOT NULL CHECK (intensity BETWEEN 1 AND 3),
    is_group BOOLEAN NOT NULL DEFAULT false,
    is_indian BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create game_sessions table
CREATE TABLE IF NOT EXISTS public.game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    current_level INTEGER NOT NULL DEFAULT 1,
    prompt_count INTEGER NOT NULL DEFAULT 0,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_prompts_level_intensity ON public.prompts(level, intensity, is_group, is_active);
CREATE INDEX IF NOT EXISTS idx_game_sessions_activity ON public.game_sessions(last_activity);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_prompts_updated_at
BEFORE UPDATE ON public.prompts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_sessions_updated_at
BEFORE UPDATE ON public.game_sessions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
