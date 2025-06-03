-- Migration: Enhance Game Features for Strangers After Hours
-- Completes implementation of activity breaks, reflection pauses, prompt packs, and solo/group prompts

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enhance activity_breaks table with additional fields
ALTER TABLE activity_breaks
ADD COLUMN IF NOT EXISTS activity_type VARCHAR(50) NOT NULL DEFAULT 'physical',  -- physical, mental, social, etc.
ADD COLUMN IF NOT EXISTS difficulty INTEGER NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 3),  -- 1: Easy, 2: Medium, 3: Hard
ADD COLUMN IF NOT EXISTS instructions TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS min_players INTEGER NOT NULL DEFAULT 2,
ADD COLUMN IF NOT EXISTS max_players INTEGER,
ADD COLUMN IF NOT EXISTS deck_specific BOOLEAN NOT NULL DEFAULT FALSE,  -- If TRUE, only show for specific deck
ADD COLUMN IF NOT EXISTS deck INTEGER CHECK (deck BETWEEN 1 AND 3);  -- 1: Strangers, 2: Friends, 3: BFFs

-- Enhance reflection_pauses table with additional fields
ALTER TABLE reflection_pauses
ADD COLUMN IF NOT EXISTS theme VARCHAR(50),  -- e.g., gratitude, growth, connection
ADD COLUMN IF NOT EXISTS follow_up_questions TEXT[],  -- Array of follow-up questions
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS deck_specific BOOLEAN NOT NULL DEFAULT FALSE,  -- If TRUE, only show for specific deck
ADD COLUMN IF NOT EXISTS deck INTEGER CHECK (deck BETWEEN 1 AND 3);  -- 1: Strangers, 2: Friends, 3: BFFs

-- Enhance prompt_packs table with additional fields
ALTER TABLE prompt_packs
ADD COLUMN IF NOT EXISTS theme VARCHAR(50),
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS deck INTEGER CHECK (deck BETWEEN 1 AND 3),  -- Associated deck if any
ADD COLUMN IF NOT EXISTS prompt_count INTEGER DEFAULT 0,  -- Number of prompts in the pack
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN NOT NULL DEFAULT FALSE;  -- If TRUE, may require purchase or special unlock

-- Enhance game_sessions table to track activity breaks and reflection pauses
ALTER TABLE game_sessions
ADD COLUMN IF NOT EXISTS activity_breaks_shown INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS reflection_pauses_shown INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS next_activity_break_after INTEGER NOT NULL DEFAULT 4,  -- Show activity break after X prompts
ADD COLUMN IF NOT EXISTS next_reflection_after INTEGER NOT NULL DEFAULT 10,  -- Show reflection after X prompts
ADD COLUMN IF NOT EXISTS solo_prompt_count INTEGER NOT NULL DEFAULT 0,  -- Track solo prompts shown
ADD COLUMN IF NOT EXISTS group_prompt_count INTEGER NOT NULL DEFAULT 0,  -- Track group prompts shown
ADD COLUMN IF NOT EXISTS last_prompt_type VARCHAR(10);  -- 'solo' or 'group' to alternate between types

-- Create a table to track which activity breaks have been shown in a session
CREATE TABLE IF NOT EXISTS session_activity_breaks (
    session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    activity_break_id UUID NOT NULL REFERENCES activity_breaks(id) ON DELETE CASCADE,
    shown_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    PRIMARY KEY (session_id, activity_break_id)
);

-- Create a table to track which reflection pauses have been shown in a session
CREATE TABLE IF NOT EXISTS session_reflection_pauses (
    session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    reflection_pause_id UUID NOT NULL REFERENCES reflection_pauses(id) ON DELETE CASCADE,
    shown_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    PRIMARY KEY (session_id, reflection_pause_id)
);

-- Create a function to get the next prompt based on game state
CREATE OR REPLACE FUNCTION get_next_prompt(
    p_session_id UUID,
    p_alternate_prompt_types BOOLEAN DEFAULT TRUE
) RETURNS TABLE (
    prompt_id UUID,
    prompt_text TEXT,
    prompt_level INTEGER,
    prompt_intensity INTEGER,
    is_activity_break BOOLEAN,
    is_reflection_pause BOOLEAN,
    activity_break_id UUID,
    reflection_pause_id UUID
) AS $$
DECLARE
    v_session RECORD;
    v_prompt_type VARCHAR(10);
    v_excluded_prompts UUID[];
BEGIN
    -- Get current session state
    SELECT 
        current_deck, 
        current_level, 
        prompts_shown,
        activity_breaks_shown,
        reflection_pauses_shown,
        next_activity_break_after,
        next_reflection_after,
        last_prompt_type,
        solo_prompt_count,
        group_prompt_count
    INTO v_session
    FROM game_sessions
    WHERE id = p_session_id;
    
    -- Get list of prompts already shown in this session
    SELECT ARRAY_AGG(prompt_id)
    INTO v_excluded_prompts
    FROM player_responses
    WHERE game_id = p_session_id;
    
    -- Check if it's time for an activity break
    IF v_session.prompts_shown > 0 AND v_session.prompts_shown % v_session.next_activity_break_after = 0 THEN
        -- Get a random activity break that hasn't been shown yet
        RETURN QUERY
        WITH unused_breaks AS (
            SELECT ab.id, ab.description as text, 1 as level, 1 as intensity
            FROM activity_breaks ab
            LEFT JOIN session_activity_breaks sab ON sab.activity_break_id = ab.id AND sab.session_id = p_session_id
            WHERE sab.activity_break_id IS NULL
            AND ab.is_active = TRUE
            AND (NOT ab.deck_specific OR ab.deck = v_session.current_deck)
            ORDER BY RANDOM()
            LIMIT 1
        )
        SELECT 
            NULL::UUID as prompt_id,
            text,
            level,
            intensity,
            TRUE as is_activity_break,
            FALSE as is_reflection_pause,
            id as activity_break_id,
            NULL::UUID as reflection_pause_id
        FROM unused_breaks;
        
        -- If we found an activity break, return it
        IF FOUND THEN
            RETURN;
        END IF;
    END IF;
    
    -- Check if it's time for a reflection pause
    IF v_session.prompts_shown > 0 AND v_session.prompts_shown % v_session.next_reflection_after = 0 THEN
        -- Get a random reflection pause that hasn't been shown yet
        RETURN QUERY
        WITH unused_pauses AS (
            SELECT rp.id, rp.question as text, 1 as level, 1 as intensity
            FROM reflection_pauses rp
            LEFT JOIN session_reflection_pauses srp ON srp.reflection_pause_id = rp.id AND srp.session_id = p_session_id
            WHERE srp.reflection_pause_id IS NULL
            AND rp.is_active = TRUE
            AND (NOT rp.deck_specific OR rp.deck = v_session.current_deck)
            ORDER BY RANDOM()
            LIMIT 1
        )
        SELECT 
            NULL::UUID as prompt_id,
            text,
            level,
            intensity,
            FALSE as is_activity_break,
            TRUE as is_reflection_pause,
            NULL::UUID as activity_break_id,
            id as reflection_pause_id
        FROM unused_pauses;
        
        -- If we found a reflection pause, return it
        IF FOUND THEN
            RETURN;
        END IF;
    END IF;
    
    -- Determine if we should get a solo or group prompt to alternate between them
    IF p_alternate_prompt_types THEN
        IF v_session.last_prompt_type = 'solo' OR v_session.last_prompt_type IS NULL THEN
            v_prompt_type := 'group';
        ELSE
            v_prompt_type := 'solo';
        END IF;
    ELSE
        -- If not alternating, use a random type
        IF RANDOM() < 0.5 THEN
            v_prompt_type := 'solo';
        ELSE
            v_prompt_type := 'group';
        END IF;
    END IF;
    
    -- Get a random prompt based on the session state and prompt type
    RETURN QUERY
    SELECT 
        p.id as prompt_id,
        p.text as prompt_text,
        p.level as prompt_level,
        p.intensity as prompt_intensity,
        FALSE as is_activity_break,
        FALSE as is_reflection_pause,
        NULL::UUID as activity_break_id,
        NULL::UUID as reflection_pause_id
    FROM prompts p
    WHERE p.deck = v_session.current_deck
    AND p.level = v_session.current_level
    AND p.is_active = TRUE
    AND p.is_group = (v_prompt_type = 'group')
    AND (v_excluded_prompts IS NULL OR p.id != ALL(v_excluded_prompts))
    ORDER BY RANDOM()
    LIMIT 1;
    
    -- If no prompt found, try again without type restriction
    IF NOT FOUND THEN
        RETURN QUERY
        SELECT 
            p.id as prompt_id,
            p.text as prompt_text,
            p.level as prompt_level,
            p.intensity as prompt_intensity,
            FALSE as is_activity_break,
            FALSE as is_reflection_pause,
            NULL::UUID as activity_break_id,
            NULL::UUID as reflection_pause_id
        FROM prompts p
        WHERE p.deck = v_session.current_deck
        AND p.level = v_session.current_level
        AND p.is_active = TRUE
        AND (v_excluded_prompts IS NULL OR p.id != ALL(v_excluded_prompts))
        ORDER BY RANDOM()
        LIMIT 1;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create a function to check if a user has unlocked a prompt pack
CREATE OR REPLACE FUNCTION has_unlocked_pack(
    p_user_id UUID,
    p_pack_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_unlocked_packs
        WHERE user_id = p_user_id AND pack_id = p_pack_id
    );
END;
$$ LANGUAGE plpgsql;

-- Create a function to unlock a prompt pack for a user
CREATE OR REPLACE FUNCTION unlock_prompt_pack(
    p_user_id UUID,
    p_pack_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
    -- Check if already unlocked
    IF has_unlocked_pack(p_user_id, p_pack_id) THEN
        RETURN FALSE;
    END IF;
    
    -- Unlock the pack
    INSERT INTO user_unlocked_packs (user_id, pack_id)
    VALUES (p_user_id, p_pack_id);
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create a function to check if a user should unlock any packs based on prompts completed
CREATE OR REPLACE FUNCTION check_pack_unlocks(
    p_user_id UUID,
    p_game_id UUID
) RETURNS TABLE (
    pack_id UUID,
    pack_name VARCHAR(100),
    pack_description TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH user_prompt_count AS (
        SELECT COUNT(*) as count
        FROM player_responses
        WHERE user_id = p_user_id AND game_id = p_game_id
    ),
    unlockable_packs AS (
        SELECT pp.id, pp.name, pp.description
        FROM prompt_packs pp
        LEFT JOIN user_unlocked_packs uup ON uup.pack_id = pp.id AND uup.user_id = p_user_id
        CROSS JOIN user_prompt_count upc
        WHERE uup.pack_id IS NULL  -- Not already unlocked
        AND pp.is_active = TRUE
        AND upc.count >= pp.unlock_after_prompts
    )
    SELECT up.id, up.name, up.description
    FROM unlockable_packs up;
    
    -- Automatically unlock the packs
    WITH unlockable_packs AS (
        SELECT pp.id
        FROM prompt_packs pp
        LEFT JOIN user_unlocked_packs uup ON uup.pack_id = pp.id AND uup.user_id = p_user_id
        JOIN player_responses pr ON pr.user_id = p_user_id AND pr.game_id = p_game_id
        WHERE uup.pack_id IS NULL  -- Not already unlocked
        AND pp.is_active = TRUE
        GROUP BY pp.id, pp.unlock_after_prompts
        HAVING COUNT(DISTINCT pr.id) >= pp.unlock_after_prompts
    )
    INSERT INTO user_unlocked_packs (user_id, pack_id)
    SELECT p_user_id, id FROM unlockable_packs;
END;
$$ LANGUAGE plpgsql;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_activity_breaks_deck ON activity_breaks(deck) WHERE deck_specific = TRUE;
CREATE INDEX IF NOT EXISTS idx_reflection_pauses_deck ON reflection_pauses(deck) WHERE deck_specific = TRUE;
CREATE INDEX IF NOT EXISTS idx_session_activity_breaks_session ON session_activity_breaks(session_id);
CREATE INDEX IF NOT EXISTS idx_session_reflection_pauses_session ON session_reflection_pauses(session_id);

-- Add triggers
DO $$
BEGIN
    -- Create triggers for updated_at on new tables
    DROP TRIGGER IF EXISTS update_activity_breaks_updated_at ON activity_breaks;
    DROP TRIGGER IF EXISTS update_reflection_pauses_updated_at ON reflection_pauses;
    
    CREATE TRIGGER update_activity_breaks_updated_at
    BEFORE UPDATE ON activity_breaks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
    CREATE TRIGGER update_reflection_pauses_updated_at
    BEFORE UPDATE ON reflection_pauses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
END$$;

-- Add sample data for activity breaks
INSERT INTO activity_breaks (title, description, activity_type, difficulty, instructions, min_players, deck_specific, deck)
VALUES 
('Quick Dance Break', 'Everyone stands up and dances to a 30-second song clip', 'physical', 1, 'Play a short song clip and have everyone dance freely. No judgment!', 2, FALSE, NULL),
('Two Truths and a Lie', 'Each player shares two truths and one lie about themselves', 'social', 1, 'Go around the circle and have each person share two true statements and one false statement about themselves. Others guess which is the lie.', 2, FALSE, NULL),
('Rock Paper Scissors Tournament', 'Quick tournament of Rock Paper Scissors', 'social', 1, 'Pair up and play best of three. Winners play winners until there is one champion.', 4, FALSE, NULL),
('Memory Challenge', 'Test your group''s memory of each other', 'mental', 2, 'Each person shares one fact about themselves. After everyone has shared, go around and have each person recall someone else''s fact.', 3, TRUE, 2),
('Group Photo', 'Take a fun group photo to remember the moment', 'social', 1, 'Set a timer and take a group photo. Be creative with poses!', 2, TRUE, 3),
('Compliment Circle', 'Share one genuine compliment with the person to your right', 'social', 2, 'Go around the circle and give a thoughtful compliment to the person on your right.', 3, TRUE, 3);

-- Add sample data for reflection pauses
INSERT INTO reflection_pauses (question, description, theme, follow_up_questions, deck_specific, deck)
VALUES 
('What has surprised you most about this conversation so far?', 'Take a moment to reflect on unexpected insights or connections', 'connection', ARRAY['Has this changed how you think about anyone in the group?', 'What would you like to learn more about?'], FALSE, NULL),
('What''s one thing you''ve learned about yourself through these prompts?', 'Consider how these discussions have revealed something about yourself', 'growth', ARRAY['Has anything challenged your previous self-perception?', 'How might this insight affect you going forward?'], FALSE, NULL),
('What conversation topic has made you most uncomfortable, and why?', 'Reflect on moments of discomfort and what they might reveal', 'vulnerability', ARRAY['What does this discomfort tell you about yourself?', 'How do you usually handle this discomfort?'], TRUE, 3),
('How has the energy of the group changed since you started playing?', 'Notice the evolution of group dynamics and connections', 'connection', ARRAY['What contributed most to this change?', 'How does this compare to other group experiences you''ve had?'], TRUE, 2),
('What question do you wish someone would ask you right now?', 'Consider what you''re hoping to express or share', 'expression', ARRAY['Why is this important for you to share?', 'What stops you from bringing this up yourself?'], FALSE, NULL);

-- Add sample data for prompt packs
INSERT INTO prompt_packs (name, description, theme, unlock_after_prompts, prompt_count, is_premium, deck)
VALUES 
('Childhood Memories', 'Nostalgic prompts about your early years', 'nostalgia', 10, 15, FALSE, NULL),
('Future Dreams', 'Prompts about hopes, dreams, and aspirations', 'aspirations', 15, 15, FALSE, NULL),
('Cultural Connections', 'Explore your cultural identity and heritage', 'culture', 20, 20, FALSE, NULL),
('Philosophical Ponderings', 'Deep questions about life, meaning, and purpose', 'philosophy', 25, 15, TRUE, 3),
('Relationship Reflections', 'Explore how you connect with others', 'relationships', 15, 20, FALSE, 2),
('Silly Scenarios', 'Lighthearted hypothetical situations', 'humor', 5, 15, FALSE, 1);

-- Add some sample prompts to the packs
WITH pack_prompts AS (
    SELECT 
        pp.id as pack_id,
        uuid_generate_v4() as prompt_id,
        CASE 
            WHEN pp.name = 'Childhood Memories' THEN 'Share a childhood memory that still makes you smile'
            WHEN pp.name = 'Future Dreams' THEN 'Describe where you see yourself in 10 years'
            WHEN pp.name = 'Cultural Connections' THEN 'What tradition from your culture are you most proud of?'
            WHEN pp.name = 'Philosophical Ponderings' THEN 'If you could know the absolute truth to one question, what would you ask?'
            WHEN pp.name = 'Relationship Reflections' THEN 'Describe your ideal relationship in three words'
            WHEN pp.name = 'Silly Scenarios' THEN 'If you were a kitchen utensil, what would you be and why?'
        END as text,
        CASE 
            WHEN pp.name = 'Childhood Memories' THEN 1
            WHEN pp.name = 'Future Dreams' THEN 2
            WHEN pp.name = 'Cultural Connections' THEN 2
            WHEN pp.name = 'Philosophical Ponderings' THEN 3
            WHEN pp.name = 'Relationship Reflections' THEN 2
            WHEN pp.name = 'Silly Scenarios' THEN 1
        END as level,
        CASE 
            WHEN pp.name = 'Childhood Memories' THEN 1
            WHEN pp.name = 'Future Dreams' THEN 2
            WHEN pp.name = 'Cultural Connections' THEN 2
            WHEN pp.name = 'Philosophical Ponderings' THEN 3
            WHEN pp.name = 'Relationship Reflections' THEN 2
            WHEN pp.name = 'Silly Scenarios' THEN 1
        END as intensity,
        CASE 
            WHEN pp.name IN ('Childhood Memories', 'Cultural Connections', 'Silly Scenarios') THEN FALSE
            ELSE TRUE
        END as is_group,
        pp.deck
    FROM prompt_packs pp
    LIMIT 6
)
INSERT INTO prompts (id, text, level, intensity, is_group, is_active, deck, is_unlockable)
SELECT prompt_id, text, level, intensity, is_group, TRUE, COALESCE(deck, 1), TRUE
FROM pack_prompts
ON CONFLICT DO NOTHING;

-- Link the sample prompts to their packs
WITH pack_prompts AS (
    SELECT 
        pp.id as pack_id,
        p.id as prompt_id
    FROM prompt_packs pp
    JOIN prompts p ON p.is_unlockable = TRUE
    WHERE pp.name IN ('Childhood Memories', 'Future Dreams', 'Cultural Connections', 
                      'Philosophical Ponderings', 'Relationship Reflections', 'Silly Scenarios')
    AND p.text IN (
        'Share a childhood memory that still makes you smile',
        'Describe where you see yourself in 10 years',
        'What tradition from your culture are you most proud of?',
        'If you could know the absolute truth to one question, what would you ask?',
        'Describe your ideal relationship in three words',
        'If you were a kitchen utensil, what would you be and why?'
    )
)
INSERT INTO prompt_pack_prompts (pack_id, prompt_id)
SELECT pack_id, prompt_id
FROM pack_prompts
ON CONFLICT DO NOTHING;

-- Update prompt counts in packs
UPDATE prompt_packs pp
SET prompt_count = (
    SELECT COUNT(*) 
    FROM prompt_pack_prompts ppp 
    WHERE ppp.pack_id = pp.id
);
