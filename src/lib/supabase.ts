import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface SiteSettings {
  id: string;
  registration_open: boolean;
  registration_url: string;
  registration_button_text: string;
  updated_at?: string;
}

export interface GlobalNotification {
  id: string;
  title: string;
  message: string;
  type: 'announcement' | 'urgent' | 'info';
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ScheduleItem {
  day: string;
  date: string;
  time?: string;
  title: string;
  status: string;
}

export interface ActionPlan {
  id: string;
  step_number: number;
  phase: string;
  date_display: string;
  target_date: string;
  timer_label: string;
  purpose: string;
  is_current_timer: boolean;
  schedule_items?: ScheduleItem[];
  created_at?: string;
  updated_at?: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    supabaseUrl.startsWith('http') &&
    !supabaseUrl.includes('your-project-id')
  );
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
