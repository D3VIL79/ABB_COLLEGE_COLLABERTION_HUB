-- ==============================================================================
-- ABB College Collaboration Hub - Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

-- 1. SITE SETTINGS TABLE (Controls Registration ON/OFF and Form URL)
CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'config',
  registration_open BOOLEAN NOT NULL DEFAULT true,
  registration_url TEXT NOT NULL DEFAULT 'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=4OkuN-CcM0CmSsBwc6kezW6EdVPy5IJMkmApxVU6LqRUMjBJNTg0U1pEQVZETFVWTldRRFUwRlhNWi4u',
  registration_button_text TEXT NOT NULL DEFAULT 'Register',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. GLOBAL NOTIFICATIONS TABLE (Announcements displayed on the main page)
CREATE TABLE IF NOT EXISTS public.global_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'announcement', -- 'announcement' | 'urgent' | 'info'
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. ACTION PLANS TABLE (Event Schedule & Hero Countdown Timer)
CREATE TABLE IF NOT EXISTS public.action_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_number INT NOT NULL,
  phase TEXT NOT NULL,
  date_display TEXT NOT NULL,
  target_date TIMESTAMPTZ NOT NULL,
  timer_label TEXT NOT NULL,
  purpose TEXT NOT NULL,
  is_current_timer BOOLEAN NOT NULL DEFAULT false,
  schedule_items JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_plans ENABLE ROW LEVEL SECURITY;

-- Allow Public READ for everyone (main landing page visitors)
DROP POLICY IF EXISTS "Public can view site settings" ON public.site_settings;
CREATE POLICY "Public can view site settings" ON public.site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view notifications" ON public.global_notifications;
CREATE POLICY "Public can view notifications" ON public.global_notifications FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view action plans" ON public.action_plans;
CREATE POLICY "Public can view action plans" ON public.action_plans FOR SELECT USING (true);

-- Allow Client / Admin WRITE operations (insert, update, delete)
DROP POLICY IF EXISTS "Allow write to site settings" ON public.site_settings;
CREATE POLICY "Allow write to site settings" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow write to notifications" ON public.global_notifications;
CREATE POLICY "Allow write to notifications" ON public.global_notifications FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow write to action plans" ON public.action_plans;
CREATE POLICY "Allow write to action plans" ON public.action_plans FOR ALL USING (true) WITH CHECK (true);

-- Enable Realtime (optional, for instant live updates)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.site_settings;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.global_notifications;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.action_plans;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_object THEN NULL;
END $$;

-- ==============================================================================
-- INITIAL SEED DATA
-- ==============================================================================

-- Seed Site Settings
INSERT INTO public.site_settings (id, registration_open, registration_url, registration_button_text)
VALUES (
  'config',
  true,
  'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=4OkuN-CcM0CmSsBwc6kezW6EdVPy5IJMkmApxVU6LqRUMjBJNTg0U1pEQVZETFVWTldRRFUwRlhNWi4u',
  'Register'
)
ON CONFLICT (id) DO UPDATE
SET
  registration_url = EXCLUDED.registration_url,
  updated_at = NOW();

-- Seed Default Notification
INSERT INTO public.global_notifications (title, message, type, is_active)
SELECT 
  'Problem Statement Submission Ongoing',
  'Problem Statement Discovery & Submission is currently live! All teams should submit their final problem statements before September 11, 2026.',
  'urgent',
  true
WHERE NOT EXISTS (SELECT 1 FROM public.global_notifications LIMIT 1);

-- Seed Initial Action Plans (With Step 3 set to Problem Statement Submission)
INSERT INTO public.action_plans (step_number, phase, date_display, target_date, timer_label, purpose, is_current_timer, schedule_items)
SELECT
  1,
  'Registration & Team Formation',
  'Aug 14 – 21, 2026',
  '2026-08-21T23:59:59+05:30'::timestamptz,
  'Registration Closes In',
  'Sign up, form teams of 5, and get paired with an industry mentor.',
  false,
  '[]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.action_plans WHERE step_number = 1);

INSERT INTO public.action_plans (step_number, phase, date_display, target_date, timer_label, purpose, is_current_timer, schedule_items)
SELECT
  2,
  'Kick-off Meeting',
  'Aug 25, 2026',
  '2026-08-25T09:00:00+05:30'::timestamptz,
  'Kick-off Meeting Starts In',
  'Official launch day with ABB leadership, mentors, and networking. Venue: ABB Plant 1, Nashik.',
  false,
  '[]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.action_plans WHERE step_number = 2);

-- Note: Active Current Timer set to Problem Statement Submission
INSERT INTO public.action_plans (step_number, phase, date_display, target_date, timer_label, purpose, is_current_timer, schedule_items)
SELECT
  3,
  'Problem Statement Submission',
  '11 September 2026',
  '2026-09-11T23:59:59+05:30'::timestamptz,
  'Problem Statement Submission In',
  'Identify real industrial challenges, finalize problem statements, and submit your proposal.',
  true,
  '[]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.action_plans WHERE step_number = 3);

INSERT INTO public.action_plans (step_number, phase, date_display, target_date, timer_label, purpose, is_current_timer, schedule_items)
SELECT
  4,
  'Training & Support',
  'Sep 2 – 3, 2026',
  '2026-09-03T17:00:00+05:30'::timestamptz,
  'Training Workshops In',
  'Focused workshops on tools, tech, and working methodologies. Faculty members are requested to arrive 15 minutes prior for gate pass arrangements.',
  false,
  '[
    {"day": "Day 1", "date": "2 Sep", "time": "10:00 AM – 12:00 PM", "title": "Digitalization & AI at ABB", "status": "Core Workshop"},
    {"day": "Day 1", "date": "2 Sep", "time": "12:00 PM – 1:00 PM", "title": "Application Development @ ABB", "status": "Core Workshop"},
    {"day": "Day 2", "date": "3 Sep", "time": "2:00 PM – 4:00 PM", "title": "Innovation Using TRIZ Method", "status": "Core Workshop"},
    {"day": "Day 2", "date": "3 Sep", "time": "4:00 PM – 5:00 PM", "title": "IoT for Manufacturing", "status": "Core Workshop"}
  ]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.action_plans WHERE step_number = 4);

INSERT INTO public.action_plans (step_number, phase, date_display, target_date, timer_label, purpose, is_current_timer, schedule_items)
SELECT
  5,
  'Use Case Development',
  'Sep – Oct – Nov, 2026',
  '2026-11-01T09:00:00+05:30'::timestamptz,
  'Development Phase Ends In',
  '90+ days of prototyping, iteration, and mentor-guided building.',
  false,
  '[]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.action_plans WHERE step_number = 5);

INSERT INTO public.action_plans (step_number, phase, date_display, target_date, timer_label, purpose, is_current_timer, schedule_items)
SELECT
  6,
  'Jury Round',
  'November, 2026',
  '2026-11-20T09:00:00+05:30'::timestamptz,
  'Jury Evaluation In',
  'Top 3 solutions shortlisted by an expert evaluation panel.',
  false,
  '[]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.action_plans WHERE step_number = 6);

INSERT INTO public.action_plans (step_number, phase, date_display, target_date, timer_label, purpose, is_current_timer, schedule_items)
SELECT
  7,
  'Evaluation & Rewards',
  'December, 2026',
  '2026-12-15T09:00:00+05:30'::timestamptz,
  'Grand Finale In',
  'Final pitches, live demos, winner announcement, and prizes.',
  false,
  '[]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.action_plans WHERE step_number = 7);
