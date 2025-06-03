-- Migration: Update Game Schema for Strangers After Hours
-- Adds support for decks, activity breaks, reflection pauses, and prompt packs

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add deck column to prompts
ALTER TABLE prompts 
ADD COLUMN IF NOT EXISTS deck INTEGER NOT NULL DEFAULT 1,  -- 1: Strangers, 2: Friends, 3: BFFs
ADD COLUMN IF NOT EXISTS unlock_after_prompts INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS is_unlockable BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS activity_break_id UUID REFERENCES activity_breaks(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_reflection_prompt BOOLEAN DEFAULT false;

-- Create enum type for prompt types
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'prompt_type') THEN
        CREATE TYPE prompt_type AS ENUM ('truth', 'dare', 'activity', 'reflection');
    END IF;
END$$;

-- Add prompt type to prompts table
ALTER TABLE prompts 
ADD COLUMN IF NOT EXISTS type prompt_type NOT NULL DEFAULT 'truth';

-- Create prompt_packs table
CREATE TABLE IF NOT EXISTS prompt_packs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    unlock_after_prompts INTEGER NOT NULL DEFAULT 10,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create junction table for prompt packs and prompts
CREATE TABLE IF NOT EXISTS prompt_pack_prompts (
    pack_id UUID NOT NULL REFERENCES prompt_packs(id) ON DELETE CASCADE,
    prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY (pack_id, prompt_id)
);

-- Create user_unlocked_packs table to track which users have unlocked which packs
CREATE TABLE IF NOT EXISTS user_unlocked_packs (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pack_id UUID NOT NULL REFERENCES prompt_packs(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, pack_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_prompts_deck ON prompts(deck);
CREATE INDEX IF NOT EXISTS idx_prompts_type ON prompts(type);
CREATE INDEX IF NOT EXISTS idx_prompt_pack_prompts_pack ON prompt_pack_prompts(pack_id);
CREATE INDEX IF NOT EXISTS idx_user_unlocked_packs_user ON user_unlocked_packs(user_id);

-- Update game_sessions table to track game progress
ALTER TABLE game_sessions 
ADD COLUMN IF NOT EXISTS current_deck INTEGER NOT NULL DEFAULT 1,  -- 1: Strangers, 2: Friends, 3: BFFs
ADD COLUMN IF NOT EXISTS prompts_shown INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_activity_break_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_reflection_at TIMESTAMP WITH TIME ZONE;

-- Add function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DO $$
BEGIN
    -- Drop existing triggers if they exist
    DROP TRIGGER IF EXISTS update_prompts_updated_at ON prompts;
    DROP TRIGGER IF EXISTS update_game_sessions_updated_at ON game_sessions;
    DROP TRIGGER IF EXISTS update_prompt_packs_updated_at ON prompt_packs;
    
    -- Create new triggers
    CREATE TRIGGER update_prompts_updated_at
    BEFORE UPDATE ON prompts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
    CREATE TRIGGER update_game_sessions_updated_at
    BEFORE UPDATE ON game_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
    CREATE TRIGGER update_prompt_packs_updated_at
    BEFORE UPDATE ON prompt_packs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
END$$;
