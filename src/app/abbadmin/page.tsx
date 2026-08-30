'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Bell,
  Check,
  CheckCircle2,
  Copy,
  Database,
  ExternalLink,
  Lock,
  LogOut,
  Plus,
  Radio,
  RefreshCw,
  Save,
  Shield,
  Sliders,
  Sparkles,
  Timer,
  Trash2,
  X,
  AlertCircle,
  Calendar,
  Layers,
  ArrowRight,
  Eye,
  RotateCcw,
} from 'lucide-react';
import { asset } from '@/utils/asset';
import {
  isSupabaseConfigured,
  SiteSettings,
  GlobalNotification,
  ActionPlan,
} from '@/lib/supabase';
import {
  getSiteSettings,
  updateSiteSettings,
  getGlobalNotifications,
  saveGlobalNotification,
  deleteGlobalNotification,
  toggleNotificationStatus,
  getActionPlans,
  saveActionPlan,
  deleteActionPlan,
  setCurrentTimerPlan,
  DEFAULT_SITE_SETTINGS,
  subscribeToDataChanges,
  resetToDefaultActionPlans,
} from '@/services/dataService';

export default function AdminPage() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Active Tab
  const [activeTab, setActiveTab] = useState<'notifications' | 'registration' | 'action_plans' | 'database'>('action_plans');

  // Status Message / Toast
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Data States
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [notifications, setNotifications] = useState<GlobalNotification[]>([]);
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([]);
  const [copiedSql, setCopiedSql] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // New Notification Form State
  const [newNotif, setNewNotif] = useState({
    title: '',
    message: '',
    type: 'urgent' as 'announcement' | 'urgent' | 'info',
    is_active: true,
  });

  // New Action Plan Form State
  const [newPlan, setNewPlan] = useState({
    step_number: 1,
    phase: '',
    date_display: '',
    target_date: '2026-09-11T23:59:59',
    timer_label: 'Problem Statement Submission In',
    purpose: '',
    is_current_timer: false,
  });

  // Editing Action Plan Modal State
  const [editingPlan, setEditingPlan] = useState<ActionPlan | null>(null);

  // Check existing session
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('abb_admin_session');
      if (stored === 'active') {
        setIsAuthenticated(true);
      }
    }
  }, []);

  // Show status feedback
  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // Load all data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [s, n, p] = await Promise.all([
        getSiteSettings(),
        getGlobalNotifications(),
        getActionPlans(),
      ]);
      setSettings(s);
      setNotifications(n);
      setActionPlans(p);
      setNewPlan((prev) => ({ ...prev, step_number: p.length + 1 }));
    } catch (e) {
      console.error('Failed to load admin data:', e);
      showToast('Error loading some data', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
      const unsubscribe = subscribeToDataChanges(loadData);
      return () => unsubscribe();
    }
  }, [isAuthenticated, loadData]);

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    const expectedEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@abb.com';
    const expectedPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'ABBadmin2026!';

    if (
      authEmail.trim().toLowerCase() === expectedEmail.toLowerCase() &&
      authPassword.trim() === expectedPassword
    ) {
      setIsAuthenticated(true);
      sessionStorage.setItem('abb_admin_session', 'active');
      showToast('Authenticated as Administrator');
    } else {
      setAuthError('Invalid credentials. Please verify your email and password.');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    sessionStorage.removeItem('abb_admin_session');
    setIsAuthenticated(false);
    setAuthEmail('');
    setAuthPassword('');
  };

  // Save Registration Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await updateSiteSettings(settings);
      setSettings(updated);
      showToast('Registration settings updated successfully');
    } catch (err) {
      console.error(err);
      showToast('Failed to update registration settings', 'error');
    }
  };

  // Create Global Notification
  const handleCreateNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotif.title.trim() || !newNotif.message.trim()) {
      showToast('Title and message are required', 'error');
      return;
    }
    try {
      await saveGlobalNotification(newNotif);
      setNewNotif({
        title: '',
        message: '',
        type: 'urgent',
        is_active: true,
      });
      await loadData();
      showToast('Global notification broadcasted!');
    } catch (err) {
      console.error(err);
      showToast('Failed to broadcast notification', 'error');
    }
  };

  // Toggle Notification Active Status
  const handleToggleNotif = async (id: string, current: boolean) => {
    try {
      await toggleNotificationStatus(id, !current);
      await loadData();
      showToast(current ? 'Notification disabled' : 'Notification activated');
    } catch (err) {
      console.error(err);
      showToast('Failed to toggle status', 'error');
    }
  };

  // Delete Notification
  const handleDeleteNotif = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notification?')) return;
    try {
      await deleteGlobalNotification(id);
      await loadData();
      showToast('Notification removed');
    } catch (err) {
      console.error(err);
      showToast('Failed to delete notification', 'error');
    }
  };

  // Add Action Plan
  const handleAddPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlan.phase.trim() || !newPlan.date_display.trim()) {
      showToast('Phase name and date display are required', 'error');
      return;
    }
    try {
      await saveActionPlan({
        step_number: Number(newPlan.step_number),
        phase: newPlan.phase.trim(),
        date_display: newPlan.date_display.trim(),
        target_date: new Date(newPlan.target_date).toISOString(),
        timer_label: newPlan.timer_label.trim() || 'Submission Deadline In',
        purpose: newPlan.purpose.trim(),
        is_current_timer: newPlan.is_current_timer,
      });
      setNewPlan({
        step_number: actionPlans.length + 2,
        phase: '',
        date_display: '',
        target_date: '2026-09-11T23:59:59',
        timer_label: 'Problem Statement Submission In',
        purpose: '',
        is_current_timer: false,
      });
      await loadData();
      showToast('New action plan added successfully!');
    } catch (err) {
      console.error(err);
      showToast('Failed to add action plan', 'error');
    }
  };

  // Save Edited Action Plan
  const handleSaveEditedPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    try {
      await saveActionPlan(editingPlan);
      setEditingPlan(null);
      await loadData();
      showToast('Action plan updated!');
    } catch (err) {
      console.error(err);
      showToast('Failed to update action plan', 'error');
    }
  };

  // Delete Action Plan
  const handleDeletePlan = async (id: string) => {
    if (!confirm('Are you sure you want to delete this action plan?')) return;
    try {
      await deleteActionPlan(id);
      await loadData();
      showToast('Action plan removed');
    } catch (err) {
      console.error(err);
      showToast('Failed to delete action plan', 'error');
    }
  };

  // Set as Active Timer
  const handleSetCurrentTimer = async (id: string) => {
    try {
      await setCurrentTimerPlan(id);
      await loadData();
      showToast('Hero Countdown Timer updated to this phase!');
    } catch (err) {
      console.error(err);
      showToast('Failed to set active timer', 'error');
    }
  };

  // Restore All Default Plans & Full Training Track
  const handleRestoreDefaultPlans = async () => {
    if (!confirm('Are you sure you want to restore all 7 default action plans and full training schedules?')) return;
    try {
      setIsLoading(true);
      const restored = await resetToDefaultActionPlans();
      setActionPlans(restored);
      await loadData();
      showToast('Restored all 7 plans and complete training track!');
    } catch (err) {
      console.error(err);
      showToast('Failed to restore action plans', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Copy SQL script to clipboard
  const copySqlSchema = () => {
    const sqlContent = `-- ==============================================================================
-- ABB College Collaboration Hub - Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'config',
  registration_open BOOLEAN NOT NULL DEFAULT true,
  registration_url TEXT NOT NULL DEFAULT 'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=4OkuN-CcM0CmSsBwc6kezW6EdVPy5IJMkmApxVU6LqRUMjBJNTg0U1pEQVZETFVWTldRRFUwRlhNWi4u',
  registration_button_text TEXT NOT NULL DEFAULT 'Register',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.global_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'announcement',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view site settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Public can view notifications" ON public.global_notifications FOR SELECT USING (true);
CREATE POLICY "Public can view action plans" ON public.action_plans FOR SELECT USING (true);

CREATE POLICY "Allow write to site settings" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow write to notifications" ON public.global_notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow write to action plans" ON public.action_plans FOR ALL USING (true) WITH CHECK (true);

-- Seed initial configuration with Problem Statement Submission as active timer
INSERT INTO public.site_settings (id, registration_open, registration_url, registration_button_text)
VALUES ('config', true, 'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=4OkuN-CcM0CmSsBwc6kezW6EdVPy5IJMkmApxVU6LqRUMjBJNTg0U1pEQVZETFVWTldRRFUwRlhNWi4u', 'Register')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.action_plans (step_number, phase, date_display, target_date, timer_label, purpose, is_current_timer)
VALUES
(1, 'Registration & Team Formation', 'Aug 14 – 21, 2026', '2026-08-21T23:59:59+05:30', 'Registration Closes In', 'Sign up, form teams of 5, and get paired with an industry mentor.', false),
(2, 'Kick-off Meeting', 'Aug 25, 2026', '2026-08-25T09:00:00+05:30', 'Kick-off Meeting Starts In', 'Official launch day with ABB leadership, mentors, and networking.', false),
(3, 'Problem Statement Submission', '11 September 2026', '2026-09-11T23:59:59+05:30', 'Problem Statement Submission In', 'Identify real industrial challenges, finalize problem statements, and submit proposal.', true),
(4, 'Training & Support', 'Sep 2 – 3, 2026', '2026-09-03T17:00:00+05:30', 'Training Workshops In', 'Focused workshops on tools, tech, and working methodologies.', false),
(5, 'Use Case Development', 'Sep – Oct – Nov, 2026', '2026-11-01T09:00:00+05:30', 'Development Phase Ends In', '90+ days of prototyping, iteration, and mentor-guided building.', false),
(6, 'Jury Round', 'November, 2026', '2026-11-20T09:00:00+05:30', 'Jury Evaluation In', 'Top 3 solutions shortlisted by an expert evaluation panel.', false),
(7, 'Evaluation & Rewards', 'December, 2026', '2026-12-15T09:00:00+05:30', 'Grand Finale In', 'Final pitches, live demos, winner announcement, and prizes.', false)
ON CONFLICT DO NOTHING;`;

    navigator.clipboard.writeText(sqlContent);
    setCopiedSql(true);
    showToast('SQL Script copied to clipboard!');
    setTimeout(() => setCopiedSql(false), 3000);
  };

  // ---------------------------------------------------------------------------
  // AUTHENTICATION SCREEN
  // ---------------------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
        <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#090909] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.8)] backdrop-blur-md">
          {/* Top red accent line */}
          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-[#ff000f] to-transparent shadow-[0_0_12px_#ff000f]" />

          {/* Logo & Header */}
          <div className="text-center">
            <div className="mx-auto mb-4 flex justify-center">
              <Image
                src={asset('/abb-logo.png')}
                alt="ABB"
                width={80}
                height={40}
                className="h-9 w-auto object-contain"
              />
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#ff000f]/30 bg-[#ff000f]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#ff000f]">
              <Shield className="h-3.5 w-3.5" />
              <span>Admin Portal</span>
            </div>
            <h1 className="mt-3 text-2xl font-black text-white">Management Console</h1>
            <p className="mt-1 text-xs text-white/50">
              Sign in with your administrative credentials to control event operations.
            </p>
          </div>

          {/* Error message */}
          {authError && (
            <div className="mt-5 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-1.5">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="admin@abb.com"
                className="w-full rounded-lg border border-white/10 bg-black/60 px-3.5 py-2.5 text-sm text-white placeholder-white/25 transition-colors focus:border-[#ff000f] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-lg border border-white/10 bg-black/60 px-3.5 py-2.5 text-sm text-white placeholder-white/25 transition-colors focus:border-[#ff000f] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-[#ff000f] bg-[#ff000f] py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-[0_0_20px_rgba(255,0,15,0.3)] transition-all hover:bg-white hover:text-black cursor-pointer"
            >
              <Lock className="h-4 w-4" />
              <span>Authenticate & Enter</span>
            </button>
          </form>

          {/* Helper hint */}
          <div className="mt-6 rounded-lg border border-white/5 bg-white/[0.02] p-3 text-center text-xs text-white/40">
            <p className="text-[11px]">
              Default test access: <code className="text-white/70">admin@abb.com</code> / <code className="text-white/70">ABBadmin2026!</code>
            </p>
            <button
              type="button"
              onClick={() => {
                setAuthEmail('admin@abb.com');
                setAuthPassword('ABBadmin2026!');
                setAuthError('');
              }}
              className="mt-2 text-xs font-semibold text-[#ff000f] hover:underline cursor-pointer flex items-center justify-center gap-1 mx-auto"
            >
              <span>⚡ Click to auto-fill credentials</span>
            </button>
          </div>

          <div className="mt-5 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/50 hover:text-white transition-colors"
            >
              <ArrowRight className="h-3.5 w-3.5 rotate-180" />
              Return to Landing Page
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // MAIN ADMIN DASHBOARD
  // ---------------------------------------------------------------------------
  const isConnected = isSupabaseConfigured();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Toast Notification */}
      {statusMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border px-4 py-3 shadow-2xl backdrop-blur-md transition-all ${
            statusMessage.type === 'success'
              ? 'border-emerald-500/40 bg-emerald-950/90 text-emerald-300'
              : 'border-red-500/40 bg-red-950/90 text-red-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <span className="text-xs font-semibold">{statusMessage.text}</span>
        </div>
      )}

      {/* Top Admin Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#090909]/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Image
              src={asset('/abb-logo.png')}
              alt="ABB"
              width={36}
              height={36}
              className="h-8 w-auto object-contain"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">ABB TRI-WIN</span>
                <span className="rounded bg-[#ff000f]/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#ff000f] border border-[#ff000f]/40">
                  Admin Console
                </span>
              </div>
              <p className="text-[10px] text-white/50">College Collaboration Event Operations</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Supabase Status Pill */}
            <div
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold ${
                isConnected
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                  : 'border-amber-500/30 bg-amber-500/10 text-amber-300'
              }`}
              title={
                isConnected
                  ? 'Connected to Supabase PostgreSQL'
                  : 'Running in Local Caching mode. Connect Supabase in .env.local'
              }
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span>{isConnected ? 'Supabase Live' : 'Local Fallback Mode'}</span>
            </div>

            {/* View Live Site */}
            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-white/80 hover:border-white/30 hover:text-white transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Live Site</span>
            </Link>

            {/* Log Out */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-white/60 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Exit</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => setActiveTab('action_plans')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shrink-0 ${
              activeTab === 'action_plans'
                ? 'border-[#ff000f] text-[#ff000f]'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>Action Plans & Timer ({actionPlans.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('registration')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shrink-0 ${
              activeTab === 'registration'
                ? 'border-[#ff000f] text-[#ff000f]'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            <Sliders className="h-4 w-4" />
            <span>Registration Controls</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shrink-0 ${
              activeTab === 'notifications'
                ? 'border-[#ff000f] text-[#ff000f]'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            <Bell className="h-4 w-4" />
            <span>Global Notifications ({notifications.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shrink-0 ${
              activeTab === 'database'
                ? 'border-[#ff000f] text-[#ff000f]'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            <Database className="h-4 w-4" />
            <span>Supabase SQL Setup</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* TAB 1: ACTION PLANS & COUNTDOWN TIMER */}
        {activeTab === 'action_plans' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white sm:text-2xl">
                  Action Plans & Countdown Timer
                </h2>
                <p className="mt-1 text-xs text-white/60">
                  Update dates, months, and phases. Choose which milestone powers the main Hero timer (e.g. Problem Statement Submission).
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRestoreDefaultPlans}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#ff000f]/40 bg-[#ff000f]/10 px-3.5 py-2 text-xs font-bold text-[#ff000f] hover:bg-[#ff000f] hover:text-white transition-all cursor-pointer"
                  title="Restores all 7 original action plans and complete training track with 8 workshops"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Restore All Plans &amp; Trainings</span>
                </button>

                <button
                  onClick={loadData}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3.5 py-2 text-xs font-semibold text-white/70 hover:border-[#ff000f] hover:text-white transition-colors cursor-pointer"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh Plans</span>
                </button>
              </div>
            </div>

            {/* Current Active Timer Highlight */}
            {actionPlans.find((p) => p.is_current_timer) && (
              <div className="relative overflow-hidden rounded-xl border border-[#ff000f]/40 bg-gradient-to-r from-[#1c0505] via-[#0e0707] to-black p-5 shadow-[0_0_30px_rgba(255,0,15,0.15)]">
                <div className="absolute top-0 right-0 h-28 w-28 translate-x-8 -translate-y-8 rounded-full bg-[#ff000f]/10 blur-2xl pointer-events-none" />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#ff000f]/20 border border-[#ff000f]/40 text-[#ff000f]">
                      <Timer className="h-5 w-5 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#ff000f]">
                          Hero Timer Target (Active on Main Page)
                        </span>
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
                      </div>
                      <h3 className="text-lg font-bold text-white">
                        {actionPlans.find((p) => p.is_current_timer)?.phase}
                      </h3>
                      <p className="mt-0.5 text-xs text-white/60">
                        Deadline: {actionPlans.find((p) => p.is_current_timer)?.date_display} ({actionPlans.find((p) => p.is_current_timer)?.target_date})
                      </p>
                      <p className="mt-1 text-xs font-medium text-red-300/80">
                        Timer Label: &quot;{actionPlans.find((p) => p.is_current_timer)?.timer_label}&quot;
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-block rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-400">
                      Live on Homepage
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Grid: Existing Plans List + Add New Plan */}
            <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
              {/* Existing Plans */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white/70">
                  Event Timeline Steps ({actionPlans.length})
                </h3>

                <div className="space-y-3">
                  {actionPlans.map((plan, idx) => (
                    <div
                      key={plan.id}
                      className={`relative rounded-xl border p-4 transition-all ${
                        plan.is_current_timer
                          ? 'border-[#ff000f]/60 bg-[#120505]/70 shadow-[0_4px_24px_rgba(255,0,15,0.12)]'
                          : 'border-white/10 bg-[#0d0d0d] hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#ff000f]">
                              Step {String(plan.step_number || idx + 1).padStart(2, '0')}
                            </span>
                            {plan.is_current_timer && (
                              <span className="rounded bg-[#ff000f]/20 border border-[#ff000f]/40 px-2 py-0.5 text-[10px] font-bold text-[#ff000f]">
                                Active Countdown Target
                              </span>
                            )}
                          </div>
                          <h4 className="text-base font-bold text-white">{plan.phase}</h4>
                          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-white/60">
                            <span className="font-semibold text-white/90">
                              📅 {plan.date_display}
                            </span>
                            <span className="text-white/40">•</span>
                            <span>Target: {new Date(plan.target_date).toLocaleDateString()}</span>
                          </div>
                          <p className="mt-2 text-xs leading-relaxed text-white/50">{plan.purpose}</p>
                          <div className="mt-2 text-[11px] text-white/40">
                            Timer Label: <span className="text-white/70">{plan.timer_label}</span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 shrink-0">
                          {!plan.is_current_timer && (
                            <button
                              onClick={() => handleSetCurrentTimer(plan.id)}
                              className="rounded border border-[#ff000f]/40 bg-[#ff000f]/10 px-2.5 py-1 text-[11px] font-bold text-[#ff000f] hover:bg-[#ff000f] hover:text-white transition-colors cursor-pointer"
                              title="Set this plan as the target of the hero countdown timer"
                            >
                              Set As Hero Timer
                            </button>
                          )}
                          <button
                            onClick={() => setEditingPlan(plan)}
                            className="rounded border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeletePlan(plan.id)}
                            className="grid h-7 w-7 place-items-center rounded border border-white/10 text-white/40 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 transition-colors cursor-pointer"
                            aria-label="Delete plan"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add New Plan Form */}
              <div className="rounded-xl border border-white/10 bg-[#0d0d0d] p-5 h-fit">
                <div className="flex items-center gap-2 mb-4">
                  <Plus className="h-4 w-4 text-[#ff000f]" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    Add New Action Plan
                  </h3>
                </div>

                <form onSubmit={handleAddPlan} className="space-y-3.5">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-white/60 mb-1">
                        Step #
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={newPlan.step_number}
                        onChange={(e) =>
                          setNewPlan({ ...newPlan, step_number: Number(e.target.value) })
                        }
                        className="w-full rounded border border-white/10 bg-black px-2.5 py-1.5 text-xs text-white focus:border-[#ff000f] focus:outline-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-white/60 mb-1">
                        Phase Title
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Problem Statement Submission"
                        value={newPlan.phase}
                        onChange={(e) => setNewPlan({ ...newPlan, phase: e.target.value })}
                        className="w-full rounded border border-white/10 bg-black px-2.5 py-1.5 text-xs text-white placeholder-white/30 focus:border-[#ff000f] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-white/60 mb-1">
                      Display Date & Month
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 11 September 2026 or Sep – Oct 2026"
                      value={newPlan.date_display}
                      onChange={(e) => setNewPlan({ ...newPlan, date_display: e.target.value })}
                      className="w-full rounded border border-white/10 bg-black px-2.5 py-1.5 text-xs text-white placeholder-white/30 focus:border-[#ff000f] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-white/60 mb-1">
                      Countdown Deadline (ISO / Local Date & Time)
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={newPlan.target_date}
                      onChange={(e) => setNewPlan({ ...newPlan, target_date: e.target.value })}
                      className="w-full rounded border border-white/10 bg-black px-2.5 py-1.5 text-xs text-white focus:border-[#ff000f] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-white/60 mb-1">
                      Timer Label
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Problem Statement Submission In"
                      value={newPlan.timer_label}
                      onChange={(e) => setNewPlan({ ...newPlan, timer_label: e.target.value })}
                      className="w-full rounded border border-white/10 bg-black px-2.5 py-1.5 text-xs text-white placeholder-white/30 focus:border-[#ff000f] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-white/60 mb-1">
                      Purpose / Description
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Brief details about what happens in this phase..."
                      value={newPlan.purpose}
                      onChange={(e) => setNewPlan({ ...newPlan, purpose: e.target.value })}
                      className="w-full rounded border border-white/10 bg-black px-2.5 py-1.5 text-xs text-white placeholder-white/30 focus:border-[#ff000f] focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="set_current_timer"
                      checked={newPlan.is_current_timer}
                      onChange={(e) =>
                        setNewPlan({ ...newPlan, is_current_timer: e.target.checked })
                      }
                      className="rounded border-white/20 text-[#ff000f] focus:ring-[#ff000f]"
                    />
                    <label htmlFor="set_current_timer" className="text-xs text-white/80 cursor-pointer">
                      Make this the active Hero countdown target
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded border border-[#ff000f] bg-[#ff000f] py-2 text-xs font-bold uppercase tracking-widest text-white shadow-[0_0_16px_rgba(255,0,15,0.3)] hover:bg-white hover:text-black transition-all cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add To Action Plan</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: REGISTRATION CONTROLS */}
        {activeTab === 'registration' && (
          <div className="max-w-3xl space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white sm:text-2xl">Registration Controls</h2>
              <p className="mt-1 text-xs text-white/60">
                Toggle registration on/off dynamically and customize the application form URL.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="rounded-xl border border-white/10 bg-[#0d0d0d] p-6 space-y-6">
              {/* Registration Toggle */}
              <div className="flex items-center justify-between border-b border-white/10 pb-6">
                <div>
                  <h3 className="text-sm font-bold text-white">Registration Status</h3>
                  <p className="mt-1 text-xs text-white/50">
                    When OFF, the Register button on the navbar and landing page displays &quot;Registration Closed&quot;.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold uppercase tracking-wider ${settings.registration_open ? 'text-emerald-400' : 'text-red-400'}`}>
                    {settings.registration_open ? 'OPEN (Active)' : 'CLOSED (Disabled)'}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setSettings({ ...settings, registration_open: !settings.registration_open })
                    }
                    className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      settings.registration_open ? 'bg-[#ff000f]' : 'bg-white/20'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        settings.registration_open ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Registration URL */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-1.5">
                  Registration Form URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    required
                    value={settings.registration_url}
                    onChange={(e) =>
                      setSettings({ ...settings, registration_url: e.target.value })
                    }
                    placeholder="https://forms.cloud.microsoft/..."
                    className="flex-1 rounded-lg border border-white/10 bg-black px-3.5 py-2 text-xs text-white placeholder-white/25 focus:border-[#ff000f] focus:outline-none"
                  />
                  <a
                    href={settings.registration_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Test Link</span>
                  </a>
                </div>
                <p className="mt-1.5 text-[11px] text-white/40">
                  Participants clicking the button will be redirected directly to this form.
                </p>
              </div>

              {/* Button Label */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-1.5">
                  Button Text
                </label>
                <input
                  type="text"
                  required
                  value={settings.registration_button_text}
                  onChange={(e) =>
                    setSettings({ ...settings, registration_button_text: e.target.value })
                  }
                  placeholder="Register"
                  className="w-full rounded-lg border border-white/10 bg-black px-3.5 py-2 text-xs text-white placeholder-white/25 focus:border-[#ff000f] focus:outline-none"
                />
              </div>

              {/* Live Preview */}
              <div className="rounded-lg border border-white/5 bg-black/60 p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-white/50 mb-3">
                  Live Preview (How it looks on Navbar)
                </p>
                <div className="flex items-center gap-4">
                  {settings.registration_open ? (
                    <span className="border border-[#ff000f] bg-[#ff000f] px-5 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white shadow-[0_0_22px_rgba(255,0,15,0.28)]">
                      {settings.registration_button_text || 'Register'}
                    </span>
                  ) : (
                    <span className="border border-white/20 bg-white/5 px-5 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white/40 cursor-not-allowed">
                      Registration Closed
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-lg border border-[#ff000f] bg-[#ff000f] px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-[0_0_20px_rgba(255,0,15,0.3)] hover:bg-white hover:text-black transition-all cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Registration Settings</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: GLOBAL NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-white sm:text-2xl">Global Notifications</h2>
              <p className="mt-1 text-xs text-white/60">
                Broadcast announcements that appear in the top banner and notification center on the main page.
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
              {/* Broadcast Form */}
              <div className="rounded-xl border border-white/10 bg-[#0d0d0d] p-5 h-fit">
                <div className="flex items-center gap-2 mb-4">
                  <Bell className="h-4 w-4 text-[#ff000f]" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    Send Global Notification
                  </h3>
                </div>

                <form onSubmit={handleCreateNotification} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-white/60 mb-1">
                      Notification Title
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Problem Statement Submission Ongoing"
                      value={newNotif.title}
                      onChange={(e) => setNewNotif({ ...newNotif, title: e.target.value })}
                      className="w-full rounded border border-white/10 bg-black px-3 py-2 text-xs text-white placeholder-white/30 focus:border-[#ff000f] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-white/60 mb-1">
                      Message Content
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Enter detailed announcement message..."
                      value={newNotif.message}
                      onChange={(e) => setNewNotif({ ...newNotif, message: e.target.value })}
                      className="w-full rounded border border-white/10 bg-black px-3 py-2 text-xs text-white placeholder-white/30 focus:border-[#ff000f] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-white/60 mb-1">
                      Urgency / Type
                    </label>
                    <select
                      value={newNotif.type}
                      onChange={(e) =>
                        setNewNotif({
                          ...newNotif,
                          type: e.target.value as 'announcement' | 'urgent' | 'info',
                        })
                      }
                      className="w-full rounded border border-white/10 bg-black px-3 py-2 text-xs text-white focus:border-[#ff000f] focus:outline-none"
                    >
                      <option value="urgent">Urgent Notice (Red Alert Icon)</option>
                      <option value="announcement">General Announcement (Bell Icon)</option>
                      <option value="info">Information Update (Cyan Info Icon)</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="notif_active"
                      checked={newNotif.is_active}
                      onChange={(e) =>
                        setNewNotif({ ...newNotif, is_active: e.target.checked })
                      }
                      className="rounded border-white/20 text-[#ff000f] focus:ring-[#ff000f]"
                    />
                    <label htmlFor="notif_active" className="text-xs text-white/80 cursor-pointer">
                      Publish immediately to main page banner
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded border border-[#ff000f] bg-[#ff000f] py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-[0_0_16px_rgba(255,0,15,0.3)] hover:bg-white hover:text-black transition-all cursor-pointer"
                  >
                    <Radio className="h-3.5 w-3.5" />
                    <span>Broadcast Notification</span>
                  </button>
                </form>
              </div>

              {/* Notifications List */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white/70">
                  Notification History ({notifications.length})
                </h3>

                <div className="space-y-3">
                  {notifications.length === 0 ? (
                    <div className="rounded-xl border border-white/5 bg-[#0d0d0d] p-6 text-center text-xs text-white/40">
                      No notifications sent yet. Create your first announcement on the left.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`rounded-xl border p-4 transition-all ${
                          n.is_active
                            ? 'border-red-500/40 bg-[#120505] shadow-[0_0_24px_rgba(255,0,15,0.12)]'
                            : 'border-white/10 bg-[#0d0d0d] opacity-60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={`rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                                  n.type === 'urgent'
                                    ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                                    : n.type === 'announcement'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                }`}
                              >
                                {n.type}
                              </span>
                              {n.is_active && (
                                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                                  Live on Banner
                                </span>
                              )}
                            </div>
                            <h4 className="text-sm font-bold text-white">{n.title}</h4>
                            <p className="mt-1 text-xs text-white/70 leading-relaxed">
                              {n.message}
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => handleToggleNotif(n.id, n.is_active)}
                              className={`rounded px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer ${
                                n.is_active
                                  ? 'border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
                                  : 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                              }`}
                            >
                              {n.is_active ? 'Unpublish' : 'Make Active'}
                            </button>
                            <button
                              onClick={() => handleDeleteNotif(n.id)}
                              className="grid h-7 w-7 place-items-center rounded border border-white/10 text-white/40 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 transition-colors cursor-pointer"
                              aria-label="Delete notification"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SUPABASE SETUP & SQL */}
        {activeTab === 'database' && (
          <div className="max-w-4xl space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white sm:text-2xl">
                Supabase Database Integration & SQL
              </h2>
              <p className="mt-1 text-xs text-white/60">
                Setup your persistent cloud database on Supabase in 3 quick steps.
              </p>
            </div>

            {/* Connection Status Box */}
            <div
              className={`rounded-xl border p-5 ${
                isConnected
                  ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300'
                  : 'border-amber-500/30 bg-amber-950/20 text-amber-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
                    isConnected ? 'bg-emerald-500/20' : 'bg-amber-500/20'
                  }`}
                >
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">
                    {isConnected
                      ? 'Connected to Supabase'
                      : 'Supabase Not Yet Configured in .env.local'}
                  </h3>
                  <p className="text-xs text-white/70 mt-0.5">
                    {isConnected
                      ? 'Live synchronization is active. All changes made in this dashboard write directly to PostgreSQL.'
                      : 'The portal is currently saving changes to local caching storage. Run the SQL schema below in Supabase to enable cloud persistence.'}
                  </p>
                </div>
              </div>
            </div>

            {/* 3 Step Setup Guide */}
            <div className="rounded-xl border border-white/10 bg-[#0d0d0d] p-6 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Quick 3-Step Setup Instructions
              </h3>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-white/5 bg-black p-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ff000f]/20 text-xs font-bold text-[#ff000f]">
                    1
                  </div>
                  <h4 className="mt-3 text-xs font-bold text-white">Create Project</h4>
                  <p className="mt-1 text-[11px] leading-relaxed text-white/50">
                    Sign up or log in at <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-[#ff000f] underline">supabase.com</a> and create a new project.
                  </p>
                </div>

                <div className="rounded-lg border border-white/5 bg-black p-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ff000f]/20 text-xs font-bold text-[#ff000f]">
                    2
                  </div>
                  <h4 className="mt-3 text-xs font-bold text-white">Run SQL Script</h4>
                  <p className="mt-1 text-[11px] leading-relaxed text-white/50">
                    Go to the <strong>SQL Editor</strong> tab in your Supabase project, paste the SQL below, and click <strong>Run</strong>.
                  </p>
                </div>

                <div className="rounded-lg border border-white/5 bg-black p-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ff000f]/20 text-xs font-bold text-[#ff000f]">
                    3
                  </div>
                  <h4 className="mt-3 text-xs font-bold text-white">Add Keys to .env.local</h4>
                  <p className="mt-1 text-[11px] leading-relaxed text-white/50">
                    Copy <code>Project URL</code> and <code>anon key</code> from Project Settings &gt; API into your <code>.env.local</code> file.
                  </p>
                </div>
              </div>
            </div>

            {/* SQL Script Box with Copy Button */}
            <div className="rounded-xl border border-white/10 bg-[#0d0d0d] p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-[#ff000f]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-white">
                    Supabase Schema SQL (Tables, Policies, &amp; Seed Data)
                  </span>
                </div>
                <button
                  onClick={copySqlSchema}
                  className="flex items-center gap-1.5 rounded-lg border border-[#ff000f] bg-[#ff000f]/15 px-3 py-1.5 text-xs font-bold text-[#ff000f] hover:bg-[#ff000f] hover:text-white transition-colors cursor-pointer"
                >
                  {copiedSql ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedSql ? 'Copied!' : 'Copy SQL Script'}</span>
                </button>
              </div>

              <div className="overflow-x-auto rounded-lg border border-white/5 bg-black p-4 text-[11px] font-mono text-white/70 max-h-96">
                <pre>{`-- 1. SITE SETTINGS TABLE (Controls Registration ON/OFF & Form Link)
CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'config',
  registration_open BOOLEAN NOT NULL DEFAULT true,
  registration_url TEXT NOT NULL DEFAULT 'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=4OkuN-CcM0CmSsBwc6kezW6EdVPy5IJMkmApxVU6LqRUMjBJNTg0U1pEQVZETFVWTldRRFUwRlhNWi4u',
  registration_button_text TEXT NOT NULL DEFAULT 'Register',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. GLOBAL NOTIFICATIONS TABLE (Announcements for main page)
CREATE TABLE IF NOT EXISTS public.global_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'announcement',
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

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view site settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Public can view notifications" ON public.global_notifications FOR SELECT USING (true);
CREATE POLICY "Public can view action plans" ON public.action_plans FOR SELECT USING (true);

CREATE POLICY "Allow write to site settings" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow write to notifications" ON public.global_notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow write to action plans" ON public.action_plans FOR ALL USING (true) WITH CHECK (true);`}</pre>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* EDIT ACTION PLAN MODAL */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-xl border border-white/20 bg-[#0d0d0d] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <h3 className="text-base font-bold text-white">Edit Action Plan</h3>
              <button
                onClick={() => setEditingPlan(null)}
                className="grid h-8 w-8 place-items-center rounded text-white/50 hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedPlan} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-white/60 mb-1">
                    Step #
                  </label>
                  <input
                    type="number"
                    value={editingPlan.step_number}
                    onChange={(e) =>
                      setEditingPlan({ ...editingPlan, step_number: Number(e.target.value) })
                    }
                    className="w-full rounded border border-white/10 bg-black px-3 py-2 text-xs text-white focus:border-[#ff000f] focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold uppercase text-white/60 mb-1">
                    Phase Title
                  </label>
                  <input
                    type="text"
                    required
                    value={editingPlan.phase}
                    onChange={(e) =>
                      setEditingPlan({ ...editingPlan, phase: e.target.value })
                    }
                    className="w-full rounded border border-white/10 bg-black px-3 py-2 text-xs text-white focus:border-[#ff000f] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-white/60 mb-1">
                  Display Date &amp; Month
                </label>
                <input
                  type="text"
                  required
                  value={editingPlan.date_display}
                  onChange={(e) =>
                    setEditingPlan({ ...editingPlan, date_display: e.target.value })
                  }
                  className="w-full rounded border border-white/10 bg-black px-3 py-2 text-xs text-white focus:border-[#ff000f] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-white/60 mb-1">
                  Countdown Deadline ISO Date
                </label>
                <input
                  type="text"
                  required
                  value={editingPlan.target_date}
                  onChange={(e) =>
                    setEditingPlan({ ...editingPlan, target_date: e.target.value })
                  }
                  placeholder="2026-09-11T23:59:59+05:30"
                  className="w-full rounded border border-white/10 bg-black px-3 py-2 text-xs text-white focus:border-[#ff000f] focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-white/60 mb-1">
                  Hero Timer Label
                </label>
                <input
                  type="text"
                  value={editingPlan.timer_label}
                  onChange={(e) =>
                    setEditingPlan({ ...editingPlan, timer_label: e.target.value })
                  }
                  className="w-full rounded border border-white/10 bg-black px-3 py-2 text-xs text-white focus:border-[#ff000f] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-white/60 mb-1">
                  Purpose / Description
                </label>
                <textarea
                  rows={3}
                  value={editingPlan.purpose}
                  onChange={(e) =>
                    setEditingPlan({ ...editingPlan, purpose: e.target.value })
                  }
                  className="w-full rounded border border-white/10 bg-black px-3 py-2 text-xs text-white focus:border-[#ff000f] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit_is_current"
                  checked={editingPlan.is_current_timer}
                  onChange={(e) =>
                    setEditingPlan({ ...editingPlan, is_current_timer: e.target.checked })
                  }
                  className="rounded border-white/20 text-[#ff000f] focus:ring-[#ff000f]"
                />
                <label htmlFor="edit_is_current" className="text-xs text-white/80 cursor-pointer">
                  Set as Hero countdown timer target
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="rounded border border-white/10 px-4 py-2 text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded border border-[#ff000f] bg-[#ff000f] px-5 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-white hover:text-black transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
