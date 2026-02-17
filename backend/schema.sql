-- Enable pgvector extension for semantic similarity
CREATE EXTENSION IF NOT EXISTS vector;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('citizen', 'officer', 'city_admin')),
    department TEXT, -- Only for officers
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create complaints table
CREATE TABLE IF NOT EXISTS complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    text TEXT NOT NULL,
    category TEXT,
    urgency TEXT CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
    department TEXT,
    status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'assigned', 'in_progress', 'resolved', 'rejected')),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    location TEXT,
    image_url TEXT,
    audio_url TEXT,
    embedding VECTOR(384), -- For semantic similarity (assuming 384 dim model)
    duplicate_group_id UUID,
    user_id UUID REFERENCES users(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_complaints_department ON complaints(department);
CREATE INDEX IF NOT EXISTS idx_complaints_urgency ON complaints(urgency);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
