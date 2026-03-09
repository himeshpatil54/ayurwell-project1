-- ============================================
-- AYURVEDA WELLNESS PLATFORM
-- Supabase Database Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE (extends Supabase auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  age INTEGER,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  height_cm NUMERIC,
  weight_kg NUMERIC,
  lifestyle TEXT CHECK (lifestyle IN ('sedentary', 'moderate', 'active')),
  consent_given BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CHAT SESSIONS
-- ============================================
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  session_metadata JSONB DEFAULT '{}'
);

-- ============================================
-- CHAT MESSAGES
-- ============================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AYURVEDIC SYMPTOMS (Knowledge Base)
-- ============================================
CREATE TABLE IF NOT EXISTS ayurvedic_symptoms (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT,
  vata_weight NUMERIC DEFAULT 0 CHECK (vata_weight >= 0 AND vata_weight <= 1),
  pitta_weight NUMERIC DEFAULT 0 CHECK (pitta_weight >= 0 AND pitta_weight <= 1),
  kapha_weight NUMERIC DEFAULT 0 CHECK (kapha_weight >= 0 AND kapha_weight <= 1),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PRAKRITI PROFILES
-- ============================================
CREATE TABLE IF NOT EXISTS prakriti_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  vata_score NUMERIC CHECK (vata_score >= 0 AND vata_score <= 100),
  pitta_score NUMERIC CHECK (pitta_score >= 0 AND pitta_score <= 100),
  kapha_score NUMERIC CHECK (kapha_score >= 0 AND kapha_score <= 100),
  dominant_dosha TEXT CHECK (dominant_dosha IN ('Vata', 'Pitta', 'Kapha', 'Vata-Pitta', 'Pitta-Kapha', 'Vata-Kapha', 'Tridoshic')),
  analysis_source TEXT CHECK (analysis_source IN ('questionnaire', 'symptoms', 'combined')),
  symptoms_analyzed TEXT[],
  questionnaire_answers JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AYURVEDIC RECOMMENDATIONS (Knowledge Base)
-- ============================================
CREATE TABLE IF NOT EXISTS ayurvedic_recommendations (
  id SERIAL PRIMARY KEY,
  target_dosha TEXT NOT NULL CHECK (target_dosha IN ('vata', 'pitta', 'kapha')),
  category TEXT NOT NULL CHECK (category IN ('diet', 'routine', 'yoga', 'pranayama', 'herbs', 'lifestyle')),
  title TEXT NOT NULL,
  recommendations JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SAVED REPORTS
-- ============================================
CREATE TABLE IF NOT EXISTS saved_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  report_type TEXT CHECK (report_type IN ('prakriti', 'symptom-analysis', 'full-analysis')),
  prakriti_id UUID REFERENCES prakriti_profiles(id),
  scores JSONB,
  symptoms TEXT[],
  recommendations JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_prakriti_profiles_user_id ON prakriti_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_reports_user_id ON saved_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_ayurvedic_symptoms_category ON ayurvedic_symptoms(category);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE prakriti_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_reports ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = auth_id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = auth_id);

CREATE POLICY "Users can view own chat sessions" ON chat_sessions
  FOR SELECT USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can create own chat sessions" ON chat_sessions
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can view own chat messages" ON chat_messages
  FOR SELECT USING (session_id IN (
    SELECT id FROM chat_sessions WHERE user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  ));

CREATE POLICY "Users can create own chat messages" ON chat_messages
  FOR INSERT WITH CHECK (session_id IN (
    SELECT id FROM chat_sessions WHERE user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  ));

CREATE POLICY "Users can view own prakriti profiles" ON prakriti_profiles
  FOR SELECT USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can create own prakriti profiles" ON prakriti_profiles
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can view own reports" ON saved_reports
  FOR SELECT USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can manage own reports" ON saved_reports
  FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Public read access to knowledge base tables
ALTER TABLE ayurvedic_symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE ayurvedic_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view symptoms" ON ayurvedic_symptoms
  FOR SELECT USING (true);

CREATE POLICY "Public can view recommendations" ON ayurvedic_recommendations
  FOR SELECT USING (true);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (auth_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- HERBAL REMEDIES (Knowledge Base)
-- ============================================
CREATE TABLE IF NOT EXISTS herbal_remedies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  herb_name TEXT NOT NULL,
  benefits TEXT,
  preparation_method TEXT,
  dosage TEXT,
  precautions TEXT,
  related_symptoms TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE herbal_remedies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view herbal remedies" ON herbal_remedies
  FOR SELECT USING (true);

CREATE POLICY "Public can insert herbal remedies" ON herbal_remedies
  FOR INSERT WITH CHECK (true);

-- ============================================
-- MEDICAL REPORT ANALYSIS (Results Storage)
-- ============================================
CREATE TABLE IF NOT EXISTS medical_report_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_name TEXT NOT NULL,
  extracted_text TEXT,
  detected_conditions TEXT,
  ayurvedic_suggestions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE medical_report_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view analysis" ON medical_report_analysis
  FOR SELECT USING (true);

CREATE POLICY "Public can insert analysis" ON medical_report_analysis
  FOR INSERT WITH CHECK (true);
