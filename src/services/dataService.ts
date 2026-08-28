import {
  supabase,
  isSupabaseConfigured,
  SiteSettings,
  GlobalNotification,
  ActionPlan,
} from '@/lib/supabase';

// Helper to generate RFC 4122 compliant UUID v4 for PostgreSQL UUID columns
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function isValidUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

// Default initial data used as seed / fallback
export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  id: 'config',
  registration_open: true,
  registration_url:
    'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=4OkuN-CcM0CmSsBwc6kezW6EdVPy5IJMkmApxVU6LqRUMjBJNTg0U1pEQVZETFVWTldRRFUwRlhNWi4u',
  registration_button_text: 'Register',
};

export const DEFAULT_NOTIFICATIONS: GlobalNotification[] = [
  {
    id: '768394be-0719-453e-8a6a-9b22c2a2a1c8',
    title: 'Problem Statement Submission Ongoing',
    message:
      'Problem Statement Discovery & Submission is currently live! All teams should submit their final problem statements before September 11, 2026.',
    type: 'urgent',
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

export const DEFAULT_ACTION_PLANS: ActionPlan[] = [
  {
    id: 'fd245536-8457-4305-aa98-c56076e91d8d',
    step_number: 1,
    phase: 'Registration & Team Formation',
    date_display: 'Aug 14 – 21, 2026',
    target_date: '2026-08-21T23:59:59+05:30',
    timer_label: 'Registration Closes In',
    purpose: 'Sign up, form teams of 5, and get paired with an industry mentor.',
    is_current_timer: false,
    schedule_items: [],
  },
  {
    id: 'de94d7ce-5cb9-4c32-b62f-ffdd1e742965',
    step_number: 2,
    phase: 'Kick-off Meeting',
    date_display: 'Aug 25, 2026',
    target_date: '2026-08-25T09:00:00+05:30',
    timer_label: 'Kick-off Meeting Starts In',
    purpose:
      'Official launch day with ABB leadership, mentors, and networking. Venue: ABB Plant 1, Nashik.',
    is_current_timer: false,
    schedule_items: [],
  },
  {
    id: 'fcc27d3c-4e7e-4132-98b2-f2cd847f65ed',
    step_number: 3,
    phase: 'Problem Statement Submission',
    date_display: '11 September 2026',
    target_date: '2026-09-11T23:59:59+05:30',
    timer_label: 'Problem Statement Submission In',
    purpose:
      'Identify real industrial challenges, finalize problem statements, and submit your proposal.',
    is_current_timer: true,
    schedule_items: [],
  },
  {
    id: 'be83744c-f421-4e42-800c-58b445cfff05',
    step_number: 4,
    phase: 'Training & Support',
    date_display: 'Aug 25 – 27, 2026',
    target_date: '2026-08-27T18:00:00+05:30',
    timer_label: 'Training Workshops In',
    purpose:
      'Focused workshops on tools, tech, and working methodologies. Runs simultaneously with Problem Discovery.',
    is_current_timer: false,
    schedule_items: [
      { day: 'Day 1', date: '25 Aug', title: 'Application Development in ABB', status: 'Core Workshop' },
      { day: 'Day 2', date: '26 Aug', title: 'Digitalization & AI', status: 'Core Workshop' },
      { day: 'Day 3', date: '27 Aug', time: '11:00 AM – 12:00 PM', title: 'IoT', status: 'Core Workshop' },
      { day: 'Day 3', date: '27 Aug', time: '12:00 PM – 1:00 PM', title: 'Innovation using TRIZ methods', status: 'Core Workshop' },
    ],
  },
  {
    id: '6d11e82a-f49c-422d-a928-6df2486b4276',
    step_number: 5,
    phase: 'Use Case Development',
    date_display: 'Sep – Oct – Nov, 2026',
    target_date: '2026-11-01T09:00:00+05:30',
    timer_label: 'Development Phase Ends In',
    purpose: '90+ days of prototyping, iteration, and mentor-guided building.',
    is_current_timer: false,
    schedule_items: [],
  },
  {
    id: 'a62d0a0b-8e37-45c9-897d-d1cbef462773',
    step_number: 6,
    phase: 'Jury Round',
    date_display: 'November, 2026',
    target_date: '2026-11-20T09:00:00+05:30',
    timer_label: 'Jury Evaluation In',
    purpose: 'Top 3 solutions shortlisted by an expert evaluation panel.',
    is_current_timer: false,
    schedule_items: [],
  },
  {
    id: 'a377716f-402f-46d8-aec3-b041b6771ea1',
    step_number: 7,
    phase: 'Evaluation & Rewards',
    date_display: 'December, 2026',
    target_date: '2026-12-15T09:00:00+05:30',
    timer_label: 'Grand Finale In',
    purpose: 'Final pitches, live demos, winner announcement, and prizes.',
    is_current_timer: false,
    schedule_items: [],
  },
];

const LOCAL_STORAGE_KEYS = {
  SETTINGS: 'abb_site_settings',
  NOTIFICATIONS: 'abb_global_notifications',
  ACTION_PLANS: 'abb_action_plans',
};

// Dispatch local event for same-tab updates
function notifyDataChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('abb-data-change'));
  }
}

// -----------------------------------------------------------------------------
// REAL-TIME AND CROSS-TAB SUBSCRIPTION
// -----------------------------------------------------------------------------
export function subscribeToDataChanges(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

  // 1. Same-tab event listener
  const handleCustom = () => callback();
  window.addEventListener('abb-data-change', handleCustom);

  // 2. Cross-tab storage listener (e.g. admin saves in Tab 1, Tab 2 updates)
  const handleStorage = (e: StorageEvent) => {
    if (
      e.key === LOCAL_STORAGE_KEYS.SETTINGS ||
      e.key === LOCAL_STORAGE_KEYS.NOTIFICATIONS ||
      e.key === LOCAL_STORAGE_KEYS.ACTION_PLANS
    ) {
      callback();
    }
  };
  window.addEventListener('storage', handleStorage);

  // 3. Tab focus / visibility listener (auto-refresh when switching back to page)
  const handleFocus = () => callback();
  window.addEventListener('focus', handleFocus);

  const handleVisibility = () => {
    if (document.visibilityState === 'visible') {
      callback();
    }
  };
  document.addEventListener('visibilitychange', handleVisibility);

  // 4. Supabase Realtime Live WebSocket Channel (across all devices & browsers)
  let channel: any = null;
  if (isSupabaseConfigured() && supabase) {
    try {
      channel = supabase
        .channel('abb-realtime-channel')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'site_settings' },
          () => callback()
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'global_notifications' },
          () => callback()
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'action_plans' },
          () => callback()
        )
        .subscribe();
    } catch (e) {
      console.warn('Realtime channel subscription error:', e);
    }
  }

  // Return clean-up function
  return () => {
    window.removeEventListener('abb-data-change', handleCustom);
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener('focus', handleFocus);
    document.removeEventListener('visibilitychange', handleVisibility);
    if (channel && supabase) {
      supabase.removeChannel(channel);
    }
  };
}

// -----------------------------------------------------------------------------
// SITE SETTINGS SERVICE
// -----------------------------------------------------------------------------

export async function getSiteSettings(): Promise<SiteSettings> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 'config')
        .single();
      if (!error && data) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(LOCAL_STORAGE_KEYS.SETTINGS, JSON.stringify(data));
        }
        return data as SiteSettings;
      }
    } catch (e) {
      console.warn('Supabase site_settings fetch error, using local fallback:', e);
    }
  }

  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEYS.SETTINGS);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {}
    }
  }

  return DEFAULT_SITE_SETTINGS;
}

export async function updateSiteSettings(
  updates: Partial<SiteSettings>
): Promise<SiteSettings> {
  const current = await getSiteSettings();
  const merged: SiteSettings = {
    ...current,
    ...updates,
    updated_at: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEYS.SETTINGS, JSON.stringify(merged));
  }

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .upsert(merged, { onConflict: 'id' })
        .select()
        .single();
      if (!error && data) {
        notifyDataChange();
        return data as SiteSettings;
      }
      if (error) {
        console.error('Supabase site_settings upsert error:', error);
      }
    } catch (e) {
      console.error('Failed to sync site_settings to Supabase:', e);
    }
  }

  notifyDataChange();
  return merged;
}

// -----------------------------------------------------------------------------
// GLOBAL NOTIFICATIONS SERVICE
// -----------------------------------------------------------------------------

export async function getGlobalNotifications(): Promise<GlobalNotification[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('global_notifications')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(LOCAL_STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(data));
        }
        return data as GlobalNotification[];
      }
    } catch (e) {
      console.warn('Supabase global_notifications fetch error, using local fallback:', e);
    }
  }

  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEYS.NOTIFICATIONS);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {}
    }
  }

  return DEFAULT_NOTIFICATIONS;
}

export async function getActiveNotification(): Promise<GlobalNotification | null> {
  const list = await getGlobalNotifications();
  return list.find((n) => n.is_active) || null;
}

export async function saveGlobalNotification(
  notification: Omit<GlobalNotification, 'id' | 'created_at' | 'updated_at'> & { id?: string }
): Promise<GlobalNotification> {
  const currentList = await getGlobalNotifications();
  const validId = notification.id && isValidUUID(notification.id) ? notification.id : generateUUID();

  const record: GlobalNotification = {
    id: validId,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    is_active: notification.is_active,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // If this notification is active, deactivate others
  let updatedList = [
    record,
    ...currentList.filter((item) => item.id !== validId),
  ];

  if (record.is_active) {
    updatedList = updatedList.map((n) =>
      n.id === validId ? n : { ...n, is_active: false }
    );
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updatedList));
  }

  if (isSupabaseConfigured() && supabase) {
    try {
      if (record.is_active) {
        await supabase
          .from('global_notifications')
          .update({ is_active: false })
          .neq('id', validId);
      }
      const { error } = await supabase.from('global_notifications').upsert(record);
      if (error) {
        console.error('Supabase global_notifications upsert error:', error);
      }
    } catch (e) {
      console.error('Failed to sync notification to Supabase:', e);
    }
  }

  notifyDataChange();
  return record;
}

export async function deleteGlobalNotification(id: string): Promise<void> {
  const currentList = await getGlobalNotifications();
  const filtered = currentList.filter((n) => n.id !== id);

  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(filtered));
  }

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('global_notifications').delete().eq('id', id);
    } catch (e) {
      console.error('Failed to delete notification from Supabase:', e);
    }
  }

  notifyDataChange();
}

export async function toggleNotificationStatus(
  id: string,
  is_active: boolean
): Promise<void> {
  const currentList = await getGlobalNotifications();
  let updated = currentList.map((n) =>
    n.id === id ? { ...n, is_active, updated_at: new Date().toISOString() } : n
  );

  if (is_active) {
    updated = updated.map((n) => (n.id === id ? n : { ...n, is_active: false }));
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
  }

  if (isSupabaseConfigured() && supabase) {
    try {
      if (is_active) {
        await supabase
          .from('global_notifications')
          .update({ is_active: false })
          .neq('id', id);
      }
      await supabase
        .from('global_notifications')
        .update({ is_active, updated_at: new Date().toISOString() })
        .eq('id', id);
    } catch (e) {
      console.error('Failed to toggle notification status in Supabase:', e);
    }
  }

  notifyDataChange();
}

// -----------------------------------------------------------------------------
// ACTION PLANS SERVICE
// -----------------------------------------------------------------------------

export async function getActionPlans(): Promise<ActionPlan[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('action_plans')
        .select('*')
        .order('step_number', { ascending: true });
      if (!error && data && data.length > 0) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(LOCAL_STORAGE_KEYS.ACTION_PLANS, JSON.stringify(data));
        }
        return data as ActionPlan[];
      }
    } catch (e) {
      console.warn('Supabase action_plans fetch error, using local fallback:', e);
    }
  }

  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEYS.ACTION_PLANS);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {}
    }
  }

  return DEFAULT_ACTION_PLANS;
}

export async function saveActionPlan(
  plan: Omit<ActionPlan, 'id' | 'created_at' | 'updated_at'> & { id?: string }
): Promise<ActionPlan> {
  const currentList = await getActionPlans();
  const validId = plan.id && isValidUUID(plan.id) ? plan.id : generateUUID();

  const record: ActionPlan = {
    id: validId,
    step_number: plan.step_number,
    phase: plan.phase,
    date_display: plan.date_display,
    target_date: plan.target_date,
    timer_label: plan.timer_label,
    purpose: plan.purpose,
    is_current_timer: plan.is_current_timer,
    schedule_items: plan.schedule_items || [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  let updatedList: ActionPlan[];
  const existingIdx = currentList.findIndex((p) => p.id === validId);

  if (existingIdx >= 0) {
    updatedList = [...currentList];
    updatedList[existingIdx] = record;
  } else {
    updatedList = [...currentList, record];
  }

  // If this plan is set as current timer, ensure others are false
  if (record.is_current_timer) {
    updatedList = updatedList.map((p) =>
      p.id === validId ? p : { ...p, is_current_timer: false }
    );
  }

  // Sort by step_number
  updatedList.sort((a, b) => a.step_number - b.step_number);

  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEYS.ACTION_PLANS, JSON.stringify(updatedList));
  }

  if (isSupabaseConfigured() && supabase) {
    try {
      if (record.is_current_timer) {
        await supabase
          .from('action_plans')
          .update({ is_current_timer: false })
          .neq('id', validId);
      }
      const { error } = await supabase.from('action_plans').upsert(record);
      if (error) {
        console.error('Supabase action_plans upsert error:', error);
      }
    } catch (e) {
      console.error('Failed to sync action plan to Supabase:', e);
    }
  }

  notifyDataChange();
  return record;
}

export async function deleteActionPlan(id: string): Promise<void> {
  const currentList = await getActionPlans();
  const filtered = currentList.filter((p) => p.id !== id);

  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEYS.ACTION_PLANS, JSON.stringify(filtered));
  }

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('action_plans').delete().eq('id', id);
    } catch (e) {
      console.error('Failed to delete action plan from Supabase:', e);
    }
  }

  notifyDataChange();
}

export async function setCurrentTimerPlan(id: string): Promise<void> {
  const currentList = await getActionPlans();
  const updated = currentList.map((p) => ({
    ...p,
    is_current_timer: p.id === id,
  }));

  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEYS.ACTION_PLANS, JSON.stringify(updated));
  }

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('action_plans').update({ is_current_timer: false }).neq('id', id);
      await supabase.from('action_plans').update({ is_current_timer: true }).eq('id', id);
    } catch (e) {
      console.error('Failed to set current timer in Supabase:', e);
    }
  }

  notifyDataChange();
}
