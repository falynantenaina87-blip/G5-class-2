-- 1. Create Tables

-- Announcements Table
CREATE TABLE IF NOT EXISTS announcements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    urgent BOOLEAN DEFAULT false
);

-- Flashcards Table
CREATE TABLE IF NOT EXISTS flashcards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    character TEXT NOT NULL,
    pinyin TEXT NOT NULL,
    translation TEXT NOT NULL,
    example_sentence TEXT, -- Initially created without constraint in this script, but existing DB might differ
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- CORRECTION DU BUG "COLUMN NOT FOUND" :
-- Exécutez cette ligne pour ajouter la colonne manquante si la table existe déjà sans elle.
ALTER TABLE flashcards ADD COLUMN IF NOT EXISTS example_sentence TEXT;

-- CORRECTION DU BUG "VIOLATES NOT-NULL CONSTRAINT" (CRITIQUE) :
-- Cette commande est INDISPENSABLE pour réparer l'erreur actuelle.
-- Elle autorise la colonne à être vide (NULL) si l'IA ne renvoie pas de phrase.
ALTER TABLE flashcards ALTER COLUMN example_sentence DROP NOT NULL;

-- Schedule Table
CREATE TABLE IF NOT EXISTS schedule (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    day TEXT NOT NULL, -- 'Monday', 'Tuesday', etc.
    start_time TEXT NOT NULL,
    subject TEXT NOT NULL,
    room TEXT,
    "order" INTEGER DEFAULT 0
);

-- Homework Table
CREATE TABLE IF NOT EXISTS homework (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    due_date TEXT,
    is_done BOOLEAN DEFAULT false, -- Shared state for the class
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Row Level Security (RLS) Setup

-- Enable RLS on all tables
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework ENABLE ROW LEVEL SECURITY;

-- Policy: Public Read (Anon Key can read everything)
DROP POLICY IF EXISTS "Public Read Announcements" ON announcements;
CREATE POLICY "Public Read Announcements" ON announcements FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Flashcards" ON flashcards;
CREATE POLICY "Public Read Flashcards" ON flashcards FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Schedule" ON schedule;
CREATE POLICY "Public Read Schedule" ON schedule FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Homework" ON homework;
CREATE POLICY "Public Read Homework" ON homework FOR SELECT USING (true);

-- Policy: Authenticated Modify (Logged in users can Insert/Update/Delete)
DROP POLICY IF EXISTS "Auth Modify Announcements" ON announcements;
CREATE POLICY "Auth Modify Announcements" ON announcements FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Auth Modify Flashcards" ON flashcards;
CREATE POLICY "Auth Modify Flashcards" ON flashcards FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Auth Modify Schedule" ON schedule;
CREATE POLICY "Auth Modify Schedule" ON schedule FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Auth Modify Homework" ON homework;
CREATE POLICY "Auth Modify Homework" ON homework FOR ALL USING (auth.role() = 'authenticated');

-- IMPORTANT: User Creation Instruction
-- Since we cannot programmatically create users with specific passwords via raw SQL 
-- without extensions like pgcrypto or admin access, please create these users 
-- manually in your Supabase Dashboard > Authentication > Users:
-- 1. juliano@g5.class (Password: L1G52526)
-- 2. delegate1@g5.class (Password: L1G52526)
-- 3. delegate2@g5.class (Password: L1G52526)