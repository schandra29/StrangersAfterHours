-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login TIMESTAMPTZ
);

-- Prompts table
CREATE TABLE IF NOT EXISTS prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    text TEXT NOT NULL,
    level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 3),  -- 1: Icebreaker, 2: Getting to Know You, 3: Deeper Dive
    intensity INTEGER NOT NULL CHECK (intensity BETWEEN 1 AND 3),  -- 1: Mild, 2: Moderate, 3: Bold
    is_group BOOLEAN NOT NULL DEFAULT FALSE,  -- TRUE for group prompts, FALSE for solo
    is_indian BOOLEAN NOT NULL DEFAULT FALSE,  -- TRUE for India-specific prompts
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Game Sessions
CREATE TABLE IF NOT EXISTS game_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(6) UNIQUE NOT NULL,  -- Join code for the game
    host_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    current_level INTEGER NOT NULL DEFAULT 1,
    current_prompt_id UUID REFERENCES prompts(id) ON DELETE SET NULL,
    prompt_count INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Players in each game session
CREATE TABLE IF NOT EXISTS game_players (
    game_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL DEFAULT 0,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_active TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (game_id, user_id)
);

-- Player responses to prompts
CREATE TABLE IF NOT EXISTS player_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    response TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(game_id, prompt_id, user_id)
);

-- Activity breaks (special prompts that appear every 4 prompts)
CREATE TABLE IF NOT EXISTS activity_breaks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    duration_seconds INTEGER NOT NULL DEFAULT 60,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reflection pauses (appear every 10 prompts)
CREATE TABLE IF NOT EXISTS reflection_pauses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question TEXT NOT NULL,
    description TEXT,
    duration_seconds INTEGER NOT NULL DEFAULT 120,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Prompt packs (unlockable after certain conditions)
CREATE TABLE IF NOT EXISTS prompt_packs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    unlock_condition TEXT NOT NULL,  -- e.g., "complete_10_prompts"
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User unlocked prompt packs
CREATE TABLE IF NOT EXISTS user_unlocked_packs (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pack_id UUID NOT NULL REFERENCES prompt_packs(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, pack_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_prompts_level_intensity ON prompts(level, intensity, is_group, is_active);
CREATE INDEX IF NOT EXISTS idx_game_sessions_code ON game_sessions(code);
CREATE INDEX IF NOT EXISTS idx_game_players_user ON game_players(user_id);
CREATE INDEX IF NOT EXISTS idx_player_responses_game_user ON player_responses(game_id, user_id);

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to update timestamps
CREATE TRIGGER update_prompts_updated_at
BEFORE UPDATE ON prompts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_sessions_updated_at
BEFORE UPDATE ON game_sessions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get a random prompt based on filters
CREATE OR REPLACE FUNCTION get_random_prompt(
    p_level INTEGER,
    p_intensity INTEGER,
    p_is_group BOOLEAN,
    p_exclude_ids UUID[] DEFAULT '{}'
) RETURNS SETOF prompts AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM prompts
    WHERE level = p_level
      AND intensity = p_intensity
      AND is_group = p_is_group
      AND is_active = TRUE
      AND (p_exclude_ids IS NULL OR id != ALL(p_exclude_ids))
    ORDER BY RANDOM()
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;
